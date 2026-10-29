import { Fragment, type ReactNode } from 'react'
import type { TOptions } from 'i18next'
import type { Translate } from './translate'

const MARK = '\u0001'

/**
 * Translates a sentence that embeds elements, e.g. a code in a `<span>`. Each
 * `{{name}}` placeholder in the translation is replaced by `slots[name]`, so
 * translators can move it freely. `options` carries the plain placeholders.
 */
export function translateRich(
  t: Translate,
  key: string,
  slots: Record<string, ReactNode>,
  options?: TOptions,
): ReactNode {
  const marked = Object.fromEntries(
    Object.keys(slots).map((name) => [name, `${MARK}${name}${MARK}`]),
  )
  const text = t(key, { ...options, ...marked })
  return text.split(MARK).map((part, index) =>
    // Odd parts sit between two marks, so they are slot names.
    index % 2 === 1 ? <Fragment key={index}>{slots[part]}</Fragment> : part,
  )
}
