import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import { createCatalogTranslate } from '@/i18n/catalog-translate'
import { createPasswordCheck } from './translated-password-check'

const messagesFor = (password: string, language: 'en' | 'el') => {
  const schema = z
    .string()
    .check(createPasswordCheck(createCatalogTranslate('validation', language)))
  const result = schema.safeParse(password)
  return result.success ? [] : result.error.issues.map((i) => i.message)
}

describe('createPasswordCheck', () => {
  it('accepts a password that meets the policy', () => {
    expect(messagesFor('Abcdefg1', 'en')).toEqual([])
  })

  it('names every unmet rule in English', () => {
    expect(messagesFor('abc', 'en')).toEqual([
      '• Password must be between 8 and 16 characters long.',
      '• Password must contain at least one uppercase letter.',
      '• Password must contain at least one digit.',
    ])
  })

  it('words the unmet rules in Greek when el is selected', () => {
    expect(messagesFor('abc', 'el')).toEqual([
      '• Ο κωδικός πρέπει να έχει από 8 έως 16 χαρακτήρες.',
      '• Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα κεφαλαίο γράμμα.',
      '• Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα ψηφίο.',
    ])
  })
})
