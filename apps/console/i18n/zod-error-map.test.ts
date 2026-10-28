import { createInstance } from 'i18next'
import { beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import {
  greekDrafts,
  translationCatalog,
  unflattenMessages,
} from '@virtality/shared/translations'
import { createZodErrorMap } from './zod-error-map'

const i18n = createInstance()

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { validation: unflattenMessages(translationCatalog.validation) },
      el: { validation: unflattenMessages(greekDrafts.validation) },
    },
  })
})

const errorMap = createZodErrorMap((key, options) => i18n.t(key, options))
const messageFor = (schema: z.ZodType, value: unknown) =>
  schema.safeParse(value, { error: errorMap }).error?.issues[0]?.message

describe('console Zod error map', () => {
  it('says a missing string is required', () => {
    expect(messageFor(z.string(), undefined)).toBe('This field is required.')
  })

  it('says an empty string with min(1) is required', () => {
    expect(messageFor(z.string().min(1), '')).toBe('This field is required.')
  })

  it('fills the min placeholder', () => {
    expect(messageFor(z.string().min(3), 'ab')).toBe(
      'Must be at least 3 characters.',
    )
  })

  it('fills the max placeholder', () => {
    expect(messageFor(z.string().max(2), 'abc')).toBe(
      'Must be at most 2 characters.',
    )
  })

  it('maps email format issues to invalid_email', () => {
    expect(messageFor(z.email(), 'nope')).toBe(
      'Provide a valid email, for example name@domain.com.',
    )
  })

  it('follows the selected language', async () => {
    await i18n.changeLanguage('el')
    expect(messageFor(z.string(), undefined)).toBe(
      'Αυτό το πεδίο είναι υποχρεωτικό.',
    )
    await i18n.changeLanguage('en')
  })
})
