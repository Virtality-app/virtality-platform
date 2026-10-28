import { describe, expect, it } from 'vitest'
import { greekDrafts, translationCatalog } from './index.ts'

const placeholders = (message: string) =>
  [...message.matchAll(/{{\w+}}|<\/?\w+>/g)].map((match) => match[0]).sort()

describe('auth translations', () => {
  it('has a Greek draft for every English key', () => {
    expect(Object.keys(greekDrafts.auth).sort()).toEqual(
      Object.keys(translationCatalog.auth).sort(),
    )
  })

  it('keeps every placeholder and tag in the Greek drafts', () => {
    for (const [key, english] of Object.entries(translationCatalog.auth)) {
      expect(placeholders(greekDrafts.auth[key]!), key).toEqual(
        placeholders(english),
      )
    }
  })
})
