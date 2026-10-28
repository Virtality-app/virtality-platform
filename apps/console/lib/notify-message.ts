import type { TOptions } from 'i18next'

/** A plain string, or a translation key (with options) resolved when shown. */
export type NotifyMessage =
  | string
  | { key: string; ns?: string; options?: Record<string, unknown> }

export const resolveNotifyMessage = (
  message: NotifyMessage,
  t: (key: string, options?: TOptions) => string,
): string =>
  typeof message === 'string'
    ? message
    : t(message.key, { ns: message.ns ?? 'common', ...message.options })
