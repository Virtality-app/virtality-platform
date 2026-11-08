import { defineConfig } from '@playwright/test'
import {
  authStatePath,
  DEMO_VIEWPORT,
  demoApps,
  type DemoAppName,
} from './apps.ts'

/**
 * Run through `pnpm demo <app> <script>`, which picks the project, then turns
 * the video into a GIF. Each app is a project with its own base URL and
 * saved sign-in.
 */
export default defineConfig({
  testDir: './scripts',
  testMatch: '*.demo.ts',
  outputDir: './.output/results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [['list']],
  use: {
    channel: process.env.DEMO_BROWSER_CHANNEL ?? 'chrome',
    viewport: DEMO_VIEWPORT,
    video: { mode: 'on', size: DEMO_VIEWPORT },
    screenshot: 'on',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    launchOptions: {
      slowMo: Number(process.env.DEMO_SLOWMO ?? 250),
    },
  },
  projects: (Object.keys(demoApps) as DemoAppName[]).map((name) => ({
    name,
    use: {
      baseURL: demoApps[name].baseURL,
      storageState: demoApps[name].signIn ? authStatePath(name) : undefined,
    },
  })),
})
