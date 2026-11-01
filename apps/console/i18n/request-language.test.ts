import { describe, expect, it } from 'vitest'
import { resolveRequestLanguage } from './request-language'

describe('resolveRequestLanguage', () => {
  it('uses the saved language cookie first', () => {
    expect(resolveRequestLanguage('el', 'en-US,en;q=0.9')).toBe('el')
  })

  it('ignores a cookie for a language the console does not support', () => {
    expect(resolveRequestLanguage('fr', 'el-GR,el;q=0.9')).toBe('el')
  })

  it('falls back to the browser languages, then English', () => {
    expect(resolveRequestLanguage(undefined, 'el-GR,el;q=0.9')).toBe('el')
    expect(resolveRequestLanguage(undefined, null)).toBe('en')
  })
})
