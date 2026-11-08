/**
 * pnpm demo:login <app>
 *
 * Opens a browser on the app for a person to sign in, then saves the session
 * for `pnpm demo` to reuse. Saving happens as soon as the session cookie
 * appears, so nobody has to come back to the terminal.
 */
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { chromium } from '@playwright/test'
import {
  authStatePath,
  DEMO_VIEWPORT,
  demoApps,
  SESSION_COOKIE,
} from '../apps.ts'
import { assertAppRunning, fail, parseApp } from './shared.ts'

const SIGN_IN_TIMEOUT_MS = 10 * 60_000

const app = parseApp(process.argv[2], 'Usage: pnpm demo:login <app>')
if (!demoApps[app].signIn) fail(`${app} needs no sign-in.`)
await assertAppRunning(app)

const browser = await chromium.launch({
  channel: process.env.DEMO_BROWSER_CHANNEL ?? 'chrome',
  headless: false,
})
const context = await browser.newContext({ viewport: DEMO_VIEWPORT })
const page = await context.newPage()
let closed = false
page.on('close', () => {
  closed = true
})
await page.goto(demoApps[app].baseURL)

console.log(`Sign in to ${app} in the browser window that just opened.`)

const deadline = Date.now() + SIGN_IN_TIMEOUT_MS
const hasSession = async () =>
  (await context.cookies()).some((cookie) => SESSION_COOKIE.test(cookie.name))

while (!(await hasSession())) {
  if (closed) fail('The browser was closed before signing in.')
  if (Date.now() > deadline) fail('Gave up waiting for a sign-in.')
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

// Let the post-sign-in redirect settle so its cookies land too.
await page.waitForLoadState('networkidle').catch(() => {})
const path = authStatePath(app)
mkdirSync(dirname(path), { recursive: true })
await context.storageState({ path })
await browser.close()

console.log(
  `✓ Saved the ${app} sign-in. Record with: pnpm demo ${app} <script>`,
)
