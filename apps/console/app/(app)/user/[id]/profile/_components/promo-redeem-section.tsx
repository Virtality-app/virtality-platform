'use client'

/**
 * Redeem, replace, or remove a Promotion or Access Code on the billing tab.
 */

import { useState, type ReactNode } from 'react'
import { isProfileBillingAccessCode } from '@virtality/shared/utils'
import type { SubscriptionDiscountRead } from '@virtality/shared/utils'
import { useClientT } from '@/i18n/use-client-t'
import type { Translate } from '@/i18n/translate'
import {
  replaceConfirmDiscountLabel,
  requiresReplaceConfirm,
} from '@/lib/profile-billing'
import {
  profileBillingCodeEntryVisible,
  resolvePromoRedeemChrome,
  type PromoRedeemChrome,
} from '@/lib/promo-redeem-chrome'
import { AppliedPromoRow } from './applied-promo-row'
import { PendingPromoHoldRow } from './pending-promo-hold-row'
import { PromoCodeEntryForm } from './promo-code-entry-form'
import { RedeemReplaceConfirmDialog } from './redeem-replace-confirm-dialog'

function promoOutcomeChrome({
  t,
  chrome,
  onRemoveLive,
  onCancelPending,
  cancelPendingPending,
}: {
  t: Translate
  chrome: PromoRedeemChrome
  onRemoveLive: () => void
  onCancelPending: () => void
  cancelPendingPending: boolean
}): ReactNode {
  switch (chrome.kind) {
    case 'pending_hold':
      return (
        <PendingPromoHoldRow
          code={chrome.code}
          canceling={cancelPendingPending}
          onCancel={onCancelPending}
        />
      )
    case 'checking_discount':
      return (
        <p className='text-sm text-zinc-500'>{t('billing.promo.checking')}</p>
      )
    case 'redeem_unavailable':
      return (
        <p className='text-sm text-zinc-500'>
          {t('billing.promo.redeemUnavailable')}
        </p>
      )
    case 'staff_blocked':
      return (
        <p className='text-sm text-zinc-500'>{t('billing.staffRedeemBlock')}</p>
      )
    case 'applied_live':
      return (
        <AppliedPromoRow appliedCode={chrome.code} onRemove={onRemoveLive} />
      )
    case 'entry':
      // Entry form is rendered below when showEntry is true.
      return null
  }
}

export function PromoRedeemSection({
  discount,
  hasEligibleSubscription,
  pendingHoldCode,
  staffBlocked,
  onRemove,
  onCancelPending,
  cancelPendingPending,
  successFlash,
  redeemError,
  onRedeem,
  redeeming,
  code,
  onCodeChange,
}: {
  discount: SubscriptionDiscountRead | undefined
  hasEligibleSubscription: boolean
  pendingHoldCode: string | null
  staffBlocked: boolean
  onRemove: () => void
  onCancelPending: () => void
  cancelPendingPending: boolean
  successFlash: boolean
  redeemError: string | null
  onRedeem: (code: string, confirmReplace: boolean) => Promise<boolean>
  redeeming: boolean
  code: string
  onCodeChange: (value: string) => void
}) {
  const { t } = useClientT(['user', 'common'])
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const chrome = resolvePromoRedeemChrome({
    hasEligibleSubscription,
    pendingHoldCode,
    discount,
    staffBlocked,
  })
  const currentLabel = hasEligibleSubscription
    ? replaceConfirmDiscountLabel(discount)
    : null
  const showEntry = profileBillingCodeEntryVisible(chrome)

  async function submitApply(confirmReplace: boolean) {
    const trimmed = code.trim()
    if (!trimmed) return
    const ok = await onRedeem(trimmed, confirmReplace)
    if (ok) {
      onCodeChange('')
      setReplaceOpen(false)
      setPendingCode(null)
    }
  }

  async function handleApplyClick() {
    const trimmed = code.trim()
    if (!trimmed) return

    if (isProfileBillingAccessCode(trimmed) || !hasEligibleSubscription) {
      await submitApply(false)
      return
    }
    if (chrome.kind === 'staff_blocked') return
    if (!discount?.ok) return

    if (requiresReplaceConfirm(discount)) {
      setPendingCode(trimmed)
      setReplaceOpen(true)
      return
    }

    await submitApply(false)
  }

  return (
    <div className='space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800'>
      <p className='text-sm font-medium'>{t('billing.codeFieldLabel')}</p>
      {promoOutcomeChrome({
        t,
        chrome,
        onRemoveLive: onRemove,
        onCancelPending,
        cancelPendingPending,
      })}
      {showEntry ? (
        <PromoCodeEntryForm
          code={code}
          onCodeChange={onCodeChange}
          redeeming={redeeming}
          redeemError={redeemError}
          successFlash={successFlash}
          onApply={() => {
            void handleApplyClick()
          }}
          applyLabel={t('billing.promo.applyCode')}
          fieldLabel={t('billing.codeFieldLabel')}
        />
      ) : null}

      <RedeemReplaceConfirmDialog
        open={replaceOpen}
        onOpenChange={setReplaceOpen}
        code={pendingCode ?? code}
        currentLabel={currentLabel}
        confirming={redeeming}
        onConfirm={() => {
          void submitApply(true)
        }}
      />
    </div>
  )
}
