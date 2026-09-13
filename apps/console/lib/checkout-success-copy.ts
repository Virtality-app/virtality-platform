import type { CheckoutSuccessIntent } from '@virtality/shared/utils'

export type CheckoutSuccessCopy = {
  headline: string
  subcopy: string
}

export function checkoutSuccessCopy(
  intent: CheckoutSuccessIntent,
): CheckoutSuccessCopy {
  switch (intent) {
    case 'subscribe':
      return {
        headline: "You're All Set",
        subcopy:
          "Thanks for subscribing, we're excited to support your next steps.",
      }
    case 'renew':
      return {
        headline: 'Thanks for Staying With Us',
        subcopy:
          'Your renewal keeps everything running smoothly. We appreciate you.',
      }
  }
}
