'use client'

import { useMemo, useState } from 'react'
import { notify } from '@/lib/notify'
import { authClient } from '@/auth-client'
import i18next from '@/i18n/i18next'
import type { NotifyMessage } from '@/lib/notify-message'
import {
  CYCLE_PLAN_CHANGE_SCHEDULED_TOAST,
  createConsoleBetterAuthBilling,
  notifyConsoleBillingAuthResult,
  type ConsoleBetterAuthBillingResult,
} from '@/lib/console-better-auth-billing'
import {
  useScheduleConsoleCyclePlanChange,
  useStartConsoleSubscribeCheckout,
} from '@virtality/react-query'
import { shouldRouteSubscribeCheckoutViaAssignedVariant } from '@virtality/shared/utils'
import {
  resolveCheckoutSuccessIntent,
  type CheckoutSuccessIntentStanding,
} from '@/lib/resolve-checkout-success-intent'

const billingText = (key: string) => i18next.t(key, { ns: 'user' })

function currentConsoleReturnUrl(): string {
  return `${window.location.origin}${window.location.pathname}${window.location.search}`
}

type ToastNotifyOptions = {
  successToast?: NotifyMessage
}

type SubscribeCheckoutStanding = CheckoutSuccessIntentStanding

/**
 * Runs a billing action once: rejects re-entry while pending, then applies
 * shared error / optional success toasts.
 */
async function runBillingAction(
  isPending: boolean,
  setPending: (pending: boolean) => void,
  busyMessage: string,
  action: () => Promise<ConsoleBetterAuthBillingResult>,
  toastOptions?: ToastNotifyOptions,
): Promise<ConsoleBetterAuthBillingResult> {
  if (isPending) {
    return { ok: false, message: busyMessage }
  }

  setPending(true)
  try {
    const result = await action()
    return notifyConsoleBillingAuthResult(result, {
      successToast: toastOptions?.successToast,
      toastError: notify.error,
      toastSuccess: notify.success,
    })
  } finally {
    setPending(false)
  }
}

/**
 * Console Profile Billing → Better Auth via one adapter for Checkout / restore /
 * portal. Cycle plan change and live Free Subscribe use orpc so Assigned
 * Variant Price ids are charged.
 */
export function useConsoleBillingAuth(standing?: SubscribeCheckoutStanding) {
  const scheduleCycleMutation = useScheduleConsoleCyclePlanChange()
  const startSubscribeCheckoutMutation = useStartConsoleSubscribeCheckout()

  const checkoutSuccessIntent = resolveCheckoutSuccessIntent(standing)

  const billing = useMemo(
    () =>
      createConsoleBetterAuthBilling({
        upgrade: (input) => authClient.subscription.upgrade(input),
        restore: (input) => authClient.subscription.restore(input),
        billingPortal: (input) => authClient.subscription.billingPortal(input),
      }),
    [],
  )

  const [isStartingCheckout, setIsStartingCheckout] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)

  const startCheckout = async (options?: { annual?: boolean }) =>
    runBillingAction(
      isStartingCheckout,
      setIsStartingCheckout,
      billingText('billing.toast.checkoutBusy'),
      async () => {
        if (
          standing &&
          shouldRouteSubscribeCheckoutViaAssignedVariant(standing)
        ) {
          try {
            const result = await startSubscribeCheckoutMutation.mutateAsync({
              annual: options?.annual ?? false,
              returnUrl: currentConsoleReturnUrl(),
            })
            window.location.assign(result.checkoutUrl)
            return { ok: true }
          } catch (error) {
            return {
              ok: false as const,
              message:
                error instanceof Error
                  ? error.message
                  : billingText('billing.toast.checkoutFailed'),
            }
          }
        }

        return billing.startCheckout({
          returnUrl: currentConsoleReturnUrl(),
          annual: options?.annual,
          checkoutSuccessIntent,
        })
      },
    )

  const scheduleCycleChange = async (options: { annual: boolean }) =>
    runBillingAction(
      isScheduling,
      setIsScheduling,
      billingText('billing.toast.scheduleBusy'),
      async () => {
        try {
          await scheduleCycleMutation.mutateAsync({ annual: options.annual })
          return { ok: true }
        } catch (error) {
          return {
            ok: false as const,
            message:
              error instanceof Error
                ? error.message
                : billingText('billing.toast.scheduleFailed'),
          }
        }
      },
      { successToast: CYCLE_PLAN_CHANGE_SCHEDULED_TOAST },
    )

  const restore = async (options?: {
    successToast?: NotifyMessage
  }): Promise<ConsoleBetterAuthBillingResult> =>
    runBillingAction(
      isRestoring,
      setIsRestoring,
      billingText('billing.toast.restoreBusy'),
      () => billing.restore(),
      { successToast: options?.successToast },
    )

  const openPortal = async () =>
    runBillingAction(
      isOpeningPortal,
      setIsOpeningPortal,
      billingText('billing.toast.portalBusy'),
      () =>
        billing.openPortal({
          returnUrl: currentConsoleReturnUrl(),
        }),
    )

  return {
    startCheckout,
    scheduleCycleChange,
    restore,
    openPortal,
    isStartingCheckout,
    isScheduling,
    isRestoring,
    isOpeningPortal,
  }
}
