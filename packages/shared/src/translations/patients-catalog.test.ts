import { describe, expect, it } from 'vitest'
import { greekDrafts, translationCatalog } from './index'

const placeholders = (text: string) =>
  [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort()

describe('patients namespace', () => {
  const en = translationCatalog.patients
  const el = greekDrafts.patients

  it('has a Greek draft for every key', () => {
    expect(Object.keys(el).sort()).toEqual(Object.keys(en).sort())
  })

  it('keeps every placeholder in the Greek draft', () => {
    for (const [key, text] of Object.entries(en)) {
      expect(placeholders(el[key]!), key).toEqual(placeholders(text))
    }
  })
})
