/**
 * pnpm demo <app> <script> [--name <file name>]
 *
 * Runs scripts/<script>.demo.ts against the app's local dev server with
 * Playwright, then turns the video into out/<name>.gif and keeps the last
 * frame as out/<name>.png. On a failed run it prints where the failure
 * screenshot and trace are instead.
 */
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { authStatePath, demoApps, SESSION_COOKIE } from '../apps.ts'
import { assertAppRunning, fail, parseApp } from './shared.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const scriptsDir = join(root, 'scripts')
const resultsDir = join(root, '.output', 'results')
const outDir = join(root, 'out')

const usage = 'Usage: pnpm demo <app> <script> [--name <file name>]'
const [appArg, scriptArg, ...rest] = process.argv.slice(2)
const app = parseApp(appArg, usage)
if (!scriptArg) fail(usage)

const scriptName = basename(scriptArg!).replace(/(\.demo)?\.ts$/, '')
const scriptFile = join(scriptsDir, `${scriptName}.demo.ts`)
if (!existsSync(scriptFile)) {
  const found = readdirSync(scriptsDir).filter((f) => f.endsWith('.demo.ts'))
  fail(
    `No script at tooling/demos/scripts/${scriptName}.demo.ts. Found: ${found.join(', ') || 'none'}`,
  )
}

const nameFlag = rest.indexOf('--name')
const outName = nameFlag === -1 ? scriptName : rest[nameFlag + 1]
if (!outName) fail(usage)

if (demoApps[app].signIn) {
  const statePath = authStatePath(app)
  if (!existsSync(statePath)) {
    fail(`No saved ${app} sign-in. Run: pnpm demo:login ${app}`)
  }
  const { cookies } = JSON.parse(readFileSync(statePath, 'utf8')) as {
    cookies: { name: string; expires: number }[]
  }
  const now = Date.now() / 1000
  const live = cookies.some(
    (c) => SESSION_COOKIE.test(c.name) && (c.expires === -1 || c.expires > now),
  )
  if (!live)
    fail(`The saved ${app} sign-in expired. Run: pnpm demo:login ${app}`)
}

if (spawnSync('ffmpeg', ['-version']).error) {
  fail('ffmpeg is missing. Install it to turn recordings into GIFs.')
}

await assertAppRunning(app)

const playwright = join(root, 'node_modules', '.bin', 'playwright')

// Playwright records video with its own ffmpeg build; a no-op once installed.
const browsers = ['ffmpeg']
if ((process.env.DEMO_BROWSER_CHANNEL ?? 'chrome') === 'chromium') {
  browsers.push('chromium')
}
const install = spawnSync(playwright, ['install', ...browsers], {
  cwd: root,
  encoding: 'utf8',
})
if (install.status !== 0) {
  fail(`playwright install ${browsers.join(' ')} failed:\n${install.stderr}`)
}

rmSync(resultsDir, { recursive: true, force: true })
const run = spawnSync(playwright, ['test', scriptFile, `--project=${app}`], {
  cwd: root,
  stdio: 'inherit',
})

const files = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { recursive: true, encoding: 'utf8' }).map((f) =>
        join(dir, f),
      )
    : []
const results = files(resultsDir)
const video = results.find((f) => f.endsWith('.webm'))
const lastFrame = results
  .filter((f) => f.endsWith('.png'))
  .sort()
  .at(-1)

if (run.status !== 0) {
  const trace = results.find((f) => f.endsWith('trace.zip'))
  const pageSnapshot = results.find((f) => f.endsWith('error-context.md'))
  fail(
    [
      'The demo failed, so no GIF was made.',
      pageSnapshot && `  page at the failure (text): ${pageSnapshot}`,
      lastFrame && `  failure screenshot: ${lastFrame}`,
      trace &&
        `  trace: pnpm --filter @virtality/demos exec playwright show-trace ${trace}`,
    ]
      .filter(Boolean)
      .join('\n'),
  )
}
if (!video) fail('Playwright finished but left no video.')

mkdirSync(outDir, { recursive: true })
const gif = join(outDir, `${outName}.gif`)
const palette =
  'fps=8,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle'
const leadInFile = results.find((f) => f.endsWith('lead-in.txt'))
const leadIn = leadInFile ? readFileSync(leadInFile, 'utf8').trim() : '0'
const convert = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-ss',
    leadIn,
    '-i',
    video!,
    '-vf',
    palette,
    gif,
  ],
  { stdio: 'inherit' },
)
if (convert.status !== 0) fail('ffmpeg could not convert the video.')

const png = join(outDir, `${outName}.png`)
if (lastFrame) copyFileSync(lastFrame, png)

const megabytes = (statSync(gif).size / 1024 / 1024).toFixed(1)
console.log(`\n✓ ${gif} (${megabytes} MB)`)
if (lastFrame) console.log(`  last frame: ${png}`)
