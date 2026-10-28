import { createInstance, type TOptions } from 'i18next'
import { beforeAll, describe, expect, it } from 'vitest'
import { resolveNotifyMessage } from './notify-message'

const i18n = createInstance()
const t = (key: string, options?: TOptions) => i18n.t(key, options)

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: {
      en: { common: { toast: { saved: 'Saved.', hello: 'Hello {{name}}' } } },
      el: { common: { toast: { saved: 'Αποθηκεύτηκε.' } } },
    },
  })
})

describe('notify messages', () => {
  it('passes plain strings through', () => {
    expect(resolveNotifyMessage('Done', t)).toBe('Done')
  })

  it('translates a key with options', () => {
    expect(
      resolveNotifyMessage({ key: 'toast.hello', options: { name: 'Ann' } }, t),
    ).toBe('Hello Ann')
  })

  it('shows a key in the selected language', async () => {
    await i18n.changeLanguage('el')
    expect(resolveNotifyMessage({ key: 'toast.saved' }, t)).toBe(
      'Αποθηκεύτηκε.',
    )
  })
})
