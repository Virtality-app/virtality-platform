import { describe, expect, it } from 'vitest'
import { isPrPreviewOrigin } from './general'

describe('isPrPreviewOrigin', () => {
  it('accepts console and adminboard PR preview aliases', () => {
    expect(isPrPreviewOrigin('https://pr-374-console.virtality.app')).toBe(true)
    expect(isPrPreviewOrigin('https://pr-1-admin.virtality.app')).toBe(true)
  })

  it('rejects other apps, schemes and look-alike hosts', () => {
    expect(isPrPreviewOrigin('https://pr-374-web.virtality.app')).toBe(false)
    expect(isPrPreviewOrigin('http://pr-374-console.virtality.app')).toBe(false)
    expect(isPrPreviewOrigin('https://pr-abc-console.virtality.app')).toBe(
      false,
    )
    expect(
      isPrPreviewOrigin('https://pr-374-console.virtality.app.evil.com'),
    ).toBe(false)
    expect(
      isPrPreviewOrigin(
        'https://evil.com/https://pr-374-console.virtality.app',
      ),
    ).toBe(false)
    expect(
      isPrPreviewOrigin('https://vir-console-fcs16iyj1-virtality.vercel.app'),
    ).toBe(false)
  })
})
