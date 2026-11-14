import { createElement } from 'react'
import { toast, type Id, type ToastOptions } from 'react-toastify'
import NotifyToast, {
  type NotifyVariant,
} from '@/components/feedback/notify-toast'
import i18next from '@/i18n/i18next'
import { resolveNotifyMessage, type NotifyMessage } from '@/lib/notify-message'
import { playAttentionSound } from '@/lib/notify-sound'

export type NotifyId = Id
export type { NotifyMessage }

const OPTIONS: Record<NotifyVariant, ToastOptions> = {
  success: {
    autoClose: 2000,
    className: 'border border-green-500',
    hideProgressBar: true,
  },
  error: {
    autoClose: 2000,
    className: 'border border-red-500',
    hideProgressBar: true,
  },
  info: {
    autoClose: 2000,
    className: 'border border-sky-500',
    hideProgressBar: true,
  },
  attention: {
    autoClose: 10000,
    className: 'border-2 border-amber-500 bg-amber-500/10',
    progressClassName: 'bg-amber-500',
    hideProgressBar: false,
  },
}

/**
 * `toastId` collapses repeats: while a toast with that id is on screen,
 * showing it again does nothing.
 */
export type NotifyOptions = { toastId?: NotifyId }

const show = (
  variant: NotifyVariant,
  message: NotifyMessage,
  options: NotifyOptions = {},
): NotifyId =>
  toast(
    createElement(NotifyToast, {
      variant,
      message: resolveNotifyMessage(message, (key, options) =>
        i18next.t(key, options),
      ),
    }),
    { ...OPTIONS[variant], ...options },
  )

/**
 * The console's only toast API. Call sites must not import `toast` from
 * `react-toastify` directly, so every toast shares one look.
 */
export const notify = {
  success: (message: NotifyMessage, options?: NotifyOptions) =>
    show('success', message, options),
  error: (message: NotifyMessage, options?: NotifyOptions) =>
    show('error', message, options),
  info: (message: NotifyMessage, options?: NotifyOptions) =>
    show('info', message, options),
  /** Patient needs the clinician: stays longer and plays a sound. */
  attention: (message: NotifyMessage) => {
    playAttentionSound()
    return show('attention', message)
  },
}
