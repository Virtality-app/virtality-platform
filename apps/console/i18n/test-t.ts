import { translationCatalog } from '@virtality/shared/translations'
import type { TranslationNamespace } from '@virtality/shared/translations'

type TOptions = Record<string, unknown>

/**
 * A `t` for component tests: English from the catalog, with `ns:key` and
 * `{{placeholder}}` support, so tests assert the copy users see.
 */
export const createTestT =
  (defaultNs: string) =>
  (key: string, options: TOptions = {}) => {
    const [prefix, rest] = key.includes(':') ? key.split(':') : [undefined, key]
    const ns = (prefix ?? options.ns ?? defaultNs) as TranslationNamespace
    const message = translationCatalog[ns]?.[rest!] ?? key
    return message.replace(/{{(\w+)}}/g, (_, name: string) =>
      String(options[name] ?? ''),
    )
  }

/** Factory for `vi.mock('@/i18n/use-client-t', ...)`. */
export const useClientTMock = () => ({
  useClientT: (ns: string | string[] = 'common') => ({
    t: createTestT(Array.isArray(ns) ? ns[0]! : ns),
  }),
})
