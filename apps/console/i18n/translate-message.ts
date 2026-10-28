import i18next from './i18next'

/**
 * A Zod `message` that is translated when the issue is raised, for custom
 * checks the shared error map cannot word on its own. `key` is in `validation`.
 */
export const translateMessage = (key: string) => () =>
  i18next.t(key, { ns: 'validation' })
