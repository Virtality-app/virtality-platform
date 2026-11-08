import { writeFileSync } from 'node:fs'
import { test as base, expect, type Page } from '@playwright/test'
import { drawCursor } from './cursor.ts'

interface DemoFixtures {
  /** Holds the frame so a viewer can read it, e.g. after a click lands. */
  beat: (ms?: number) => Promise<void>
}

/**
 * Playwright's `test` for demos: the page shows the mouse, and the recording
 * holds on the final state before it stops.
 */
export const test = base.extend<DemoFixtures>({
  page: async ({ page }, use, testInfo) => {
    // The video starts blank, before the first page loads. Note when that
    // load lands so `pnpm demo` can cut the blank lead-in.
    const videoStart = Date.now()
    page.once('load', () => {
      const leadIn = ((Date.now() - videoStart) / 1000).toFixed(2)
      writeFileSync(testInfo.outputPath('lead-in.txt'), leadIn)
    })
    await page.addInitScript(drawCursor)
    await use(page)
    await page.waitForTimeout(2000)
  },
  beat: async ({ page }, use) => {
    await use((ms = 1000) => page.waitForTimeout(ms))
  },
})

export { expect, type Page }
