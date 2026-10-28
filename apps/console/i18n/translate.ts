import type { TOptions } from 'i18next'

/** The slice of i18next's `t` that pure formatting helpers need. */
export type Translate = (key: string, options?: TOptions) => string
