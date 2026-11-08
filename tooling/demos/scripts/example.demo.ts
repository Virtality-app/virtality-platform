import { expect, test } from '../demo.ts'

// Template for a demo: one flow, under about 30 seconds, ending on the
// visible result. Record it with `pnpm demo website example`.
test('footer link opens the contact page', async ({ page, beat }) => {
  await page.goto('/')
  await beat()

  const footer = page.locator('footer')
  await footer.scrollIntoViewIfNeeded()
  await beat()

  await footer.getByRole('link', { name: /contact/i }).click()
  await expect(page).toHaveURL(/\/contact/)
})
