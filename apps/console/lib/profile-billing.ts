/**
 * Profile → Billing presentation helpers (stacked plan cards).
 * Catalog list prices load from Stripe at runtime via consoleBilling.readCatalog.
 */

import type { Translate } from '@/i18n/translate'
import {
  DEFAULT_PLAN_PRODUCT_NAME_FALLBACK,
  buildDiscountedBillingPriceLabels,
  canRemovePromoDiscount,
  isPaidDefaultPortalEligible,
  isStaffRedeemBlocked,
  promoCodeLabel,
  replaceConfirmDiscountLabel,
  requiresReplaceConfirm,
  resolveBillingDiscountDisplay,
  resolveProfileBillingCheckoutCta,
  shouldScheduleSubscriptionChangeAtPeriodEnd,
  type BillingCatalogForUserRead,
  type BillingCatalogMinor,
  type BillingDiscountDisplay,
  type BillingPlanPriceLabels,
  type DiscountedBillingPriceLabels,
  type EntitlementBillingInterval,
  type SubscriptionDiscountRead,
} from '@virtality/shared/utils'

export type BillingInterval = EntitlementBillingInterval

export type BillingPlanPrices = BillingPlanPriceLabels

/** Text helpers for billing copy: `t` resolves in `user`, `locale` formats dates. */
export type BillingCopy = {
  t: Translate
  /** Active i18next language, e.g. `en` or `el`. */
  locale: string
}

const INTL_LOCALES: Record<string, string> = { el: 'el-GR' }

/** Entitlement Clock end in the selected language; UTC to match Stripe periods. */
export function formatClockEnd({ locale }: BillingCopy, clockEnd: Date) {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(clockEnd)
}

/** Upgrade/Downgrade label for switching to the given interval. */
function profileBillingIntervalSwitchLabel(
  { t }: BillingCopy,
  target: BillingInterval,
): string {
  return t(
    target === 'year' ? 'billing.action.upgrade' : 'billing.action.downgrade',
  )
}

/** Pending-label copy for switching to the given interval. */
function profileBillingIntervalSwitchPendingLabel(
  { t }: BillingCopy,
  target: BillingInterval,
): string {
  return t(
    target === 'year'
      ? 'billing.action.upgrading'
      : 'billing.action.downgrading',
  )
}

/** Cancel Upgrade/Cancel Downgrade label for releasing a scheduled switch. */
function profileBillingIntervalCancelSwitchLabel(
  { t }: BillingCopy,
  target: BillingInterval,
): string {
  return t(
    target === 'year'
      ? 'billing.action.cancelUpgrade'
      : 'billing.action.cancelDowngrade',
  )
}

export type ProfileBillingCardActionConfirm = {
  title: string
  body: string
  confirmLabel: string
}

export type ProfileBillingCardAction =
  | { kind: 'none'; label: null; pendingLabel: null }
  | {
      kind: 'active'
      label: string
      pendingLabel: string
    }
  | {
      kind: 'checkout'
      label: string
      pendingLabel: string
    }
  | {
      kind: 'schedule'
      label: string
      pendingLabel: string
      confirm: ProfileBillingCardActionConfirm
    }
  | {
      kind: 'cancel_schedule'
      label: string
      pendingLabel: string
      confirm: ProfileBillingCardActionConfirm
    }
  | {
      kind: 'restore_cancellation'
      label: string
      pendingLabel: string
    }

/** Structured plan-card action kinds; UI dispatches on these, never on label copy. */
export type ProfileBillingCardActionKind = ProfileBillingCardAction['kind']

/** Plan-card action that renders a CTA (excludes inert `none`). */
export type ProfileBillingCardActiveAction = Exclude<
  ProfileBillingCardAction,
  { kind: 'none' }
>

const NONE_ACTION: ProfileBillingCardAction = {
  kind: 'none',
  label: null,
  pendingLabel: null,
}

/** Drop inert `none` actions before wiring plan-card CTAs. */
export function profileBillingCardActiveAction(
  action: ProfileBillingCardAction,
): ProfileBillingCardActiveAction | null {
  return action.kind === 'none' ? null : action
}

/** Confirm dialog copy when the action requires a confirmation step. */
export function profileBillingCardActionConfirm(
  action: ProfileBillingCardAction,
): ProfileBillingCardActionConfirm | null {
  switch (action.kind) {
    case 'schedule':
    case 'cancel_schedule':
      return action.confirm
    default:
      return null
  }
}

export {
  DEFAULT_PLAN_PRODUCT_NAME_FALLBACK,
  buildDiscountedBillingPriceLabels,
  canRemovePromoDiscount,
  isStaffRedeemBlocked,
  promoCodeLabel,
  replaceConfirmDiscountLabel,
  requiresReplaceConfirm,
  resolveBillingDiscountDisplay,
  shouldScheduleSubscriptionChangeAtPeriodEnd,
}

export type BillingStandingView = {
  entitled: boolean
  status: string | null
  plan: string | null
  billingPathEstablished: boolean
  hadPaidBilling: boolean
  billingInterval: BillingInterval | null
  clockEnd: Date | string | null
  /** Stripe schedule queued for period-end interval switch. */
  hasPendingPlanChange: boolean
  /** Stripe cancel-at-period-end on the live seat. */
  cancelAtPeriodEnd: boolean
}

export function profileBillingIntervalTitle(
  { t }: BillingCopy,
  interval: BillingInterval,
): string {
  return t(interval === 'year' ? 'billing.yearly' : 'billing.monthly')
}

/** Opposite Default interval when a period-end switch is scheduled. */
export function profileBillingPendingTargetInterval(
  standing: Pick<
    BillingStandingView,
    'hasPendingPlanChange' | 'billingInterval'
  >,
): BillingInterval | null {
  if (!standing.hasPendingPlanChange || standing.billingInterval == null) {
    return null
  }
  return standing.billingInterval === 'month' ? 'year' : 'month'
}

function resolveProfileBillingPlanCardCheckoutCta(
  standing: BillingStandingView,
  hasStripeCustomer: boolean,
) {
  return resolveProfileBillingCheckoutCta({
    entitled: standing.entitled,
    hasStripeCustomer,
    hadPaidBilling: standing.hadPaidBilling,
    plan: standing.plan,
    status: standing.status,
  })
}

/**
 * Centralized Manage billing CTA. Paid Default seats with a live clock open the
 * Customer Portal; Free and trialing clinicians use per-card Checkout instead.
 */
export function profileBillingPrimaryCtaLabel(
  { t }: BillingCopy,
  standing: BillingStandingView,
): string | null {
  if (profileBillingOpensPortal(standing)) return t('billing.manageBilling')
  return null
}

export function profileBillingOpensPortal(
  standing: Pick<BillingStandingView, 'entitled' | 'plan' | 'status'>,
): boolean {
  return isPaidDefaultPortalEligible(standing)
}

/** Whether plan cards should expose Checkout / interval-switch actions. */
export function profileBillingShowsPlanCardCheckout(
  standing: BillingStandingView,
  hasStripeCustomer: boolean,
): boolean {
  if (profileBillingOpensPortal(standing)) return true
  return (
    resolveProfileBillingPlanCardCheckoutCta(standing, hasStripeCustomer) !=
    null
  )
}

/**
 * Interval-specific plan-card action. Free / Renew seats share one
 * Subscribe/Renew checkout on both cards. Live paid Default schedules "Upgrade" on
 * the other interval, or "Cancel" when that switch is already scheduled. While
 * cancel-at-period-end is set, the current interval restores ("Don't cancel")
 * and the other interval checkouts "Upgrade" (pay now, not period-end schedule).
 */
export function resolveProfileBillingCardAction(
  copy: BillingCopy,
  standing: BillingStandingView,
  hasStripeCustomer: boolean,
  interval: BillingInterval,
): ProfileBillingCardAction {
  if (profileBillingOpensPortal(standing)) {
    if (standing.cancelAtPeriodEnd) {
      if (standing.billingInterval === interval) {
        return {
          kind: 'restore_cancellation',
          label: copy.t('billing.action.dontCancel'),
          pendingLabel: copy.t('billing.action.restoring'),
        }
      }
      return {
        kind: 'checkout',
        label: profileBillingIntervalSwitchLabel(copy, interval),
        pendingLabel: profileBillingIntervalSwitchPendingLabel(copy, interval),
      }
    }
    if (standing.billingInterval === interval) {
      return {
        kind: 'active',
        label: copy.t('billing.action.active'),
        pendingLabel: copy.t('billing.action.active'),
      }
    }
    const pendingTarget = profileBillingPendingTargetInterval(standing)
    if (pendingTarget != null) {
      if (pendingTarget !== interval) return NONE_ACTION
      const confirm = profileBillingIntervalCancelConfirmCopy(copy, standing)
      if (confirm == null) return NONE_ACTION
      return {
        kind: 'cancel_schedule',
        label: profileBillingIntervalCancelSwitchLabel(copy, interval),
        pendingLabel: copy.t('billing.action.canceling'),
        confirm,
      }
    }
    return {
      kind: 'schedule',
      label: profileBillingIntervalSwitchLabel(copy, interval),
      pendingLabel: profileBillingIntervalSwitchPendingLabel(copy, interval),
      confirm: profileBillingIntervalUpgradeConfirmCopy(
        copy,
        standing,
        interval,
      ),
    }
  }

  const cta = resolveProfileBillingPlanCardCheckoutCta(
    standing,
    hasStripeCustomer,
  )
  if (cta == null) return NONE_ACTION

  return {
    kind: 'checkout',
    label: copy.t(`billing.action.${cta}`),
    pendingLabel: copy.t('billing.action.startingCheckout'),
  }
}

/** Whether an upgrade from this standing should schedule at period end. */
export function profileBillingSchedulesAtPeriodEnd(
  standing: Pick<
    BillingStandingView,
    'plan' | 'entitled' | 'status' | 'cancelAtPeriodEnd'
  >,
): boolean {
  if (standing.cancelAtPeriodEnd) return false
  return (
    profileBillingOpensPortal(standing) &&
    shouldScheduleSubscriptionChangeAtPeriodEnd(standing.plan)
  )
}

/** Banner copy while a period-end interval switch is scheduled. */
export function profileBillingPendingPlanChangeBanner(
  copy: BillingCopy,
  standing: BillingStandingView,
): string | null {
  const target = profileBillingPendingTargetInterval(standing)
  if (target == null) return null

  const interval = profileBillingIntervalTitle(copy, target)
  if (standing.clockEnd) {
    const date = formatClockEnd(copy, new Date(standing.clockEnd))
    return copy.t('billing.pendingPlanChange.withDate', { interval, date })
  }
  return copy.t('billing.pendingPlanChange.withoutDate', { interval })
}

/** Warning banner while cancel-at-period-end is scheduled. */
export function profileBillingPendingCancellationBanner(
  copy: BillingCopy,
  standing: BillingStandingView,
  productName: string = DEFAULT_PLAN_PRODUCT_NAME_FALLBACK,
): string | null {
  if (!standing.cancelAtPeriodEnd || !standing.entitled) return null
  if (standing.clockEnd) {
    const date = formatClockEnd(copy, new Date(standing.clockEnd))
    return copy.t('billing.pendingCancellation.withDate', {
      date,
      product: productName,
    })
  }
  return copy.t('billing.pendingCancellation.withoutDate', {
    product: productName,
  })
}

/** Confirm-dialog body for scheduling an interval switch. */
function profileBillingIntervalUpgradeConfirmCopy(
  copy: BillingCopy,
  standing: BillingStandingView,
  targetInterval: BillingInterval,
): ProfileBillingCardActionConfirm {
  const { t } = copy
  const current =
    standing.billingInterval != null
      ? profileBillingIntervalTitle(copy, standing.billingInterval)
      : t('billing.currentPlan')
  const date = standing.clockEnd
    ? formatClockEnd(copy, new Date(standing.clockEnd))
    : null

  return {
    title: t('billing.confirm.switchTitle', {
      interval: profileBillingIntervalTitle(copy, targetInterval),
    }),
    body: date
      ? t('billing.confirm.switchBodyWithDate', { date, current })
      : t('billing.confirm.switchBody', { current }),
    confirmLabel: profileBillingIntervalSwitchLabel(copy, targetInterval),
  }
}

/** Confirm-dialog body for releasing a scheduled interval switch. */
function profileBillingIntervalCancelConfirmCopy(
  copy: BillingCopy,
  standing: BillingStandingView,
): ProfileBillingCardActionConfirm | null {
  const target = profileBillingPendingTargetInterval(standing)
  if (target == null) return null
  return {
    title: copy.t('billing.confirm.cancelSwitchTitle', {
      interval: profileBillingIntervalTitle(copy, target),
    }),
    body: copy.t('billing.confirm.cancelSwitchBody'),
    confirmLabel: profileBillingIntervalCancelSwitchLabel(copy, target),
  }
}

/** Access Gate trial whose clock has ended: Billing shows expired styling. */
export function profileBillingIsLapsedAccessGateTrial(
  standing: Pick<BillingStandingView, 'entitled' | 'status'>,
): boolean {
  return standing.status === 'trialing' && !standing.entitled
}

export function profileBillingStatusHeadline(
  { t }: BillingCopy,
  standing: BillingStandingView,
  productName: string = DEFAULT_PLAN_PRODUCT_NAME_FALLBACK,
): string {
  if (standing.status === 'trialing') {
    return t(
      profileBillingIsLapsedAccessGateTrial(standing)
        ? 'billing.status.expired'
        : 'billing.status.trialInProgress',
    )
  }

  if (
    standing.status === 'granted' ||
    standing.status === 'revoked' ||
    standing.status === null
  ) {
    return t('billing.status.noPlan')
  }

  if (standing.entitled) {
    if (standing.billingInterval === 'year') {
      return t('billing.status.productYearly', { product: productName })
    }
    if (standing.billingInterval === 'month') {
      return t('billing.status.productMonthly', { product: productName })
    }
    return productName
  }

  switch (standing.status) {
    case 'canceled':
      return t('billing.status.canceled')
    default:
      return t('billing.status.ended')
  }
}

export function profileBillingStatusDetail(
  copy: BillingCopy,
  standing: BillingStandingView,
  productName: string = DEFAULT_PLAN_PRODUCT_NAME_FALLBACK,
): string {
  const { t } = copy
  if (standing.clockEnd) {
    const date = formatClockEnd(copy, new Date(standing.clockEnd))
    if (standing.status === 'trialing') {
      return t('billing.statusDetail.ends', { date })
    }
    if (standing.cancelAtPeriodEnd) {
      return t('billing.statusDetail.ends', { date })
    }
    if (standing.hasPendingPlanChange) {
      const target = profileBillingPendingTargetInterval(standing)
      if (target != null) {
        return t('billing.statusDetail.renewsSwitching', {
          date,
          interval: profileBillingIntervalTitle(copy, target),
        })
      }
    }
    return t('billing.statusDetail.renews', { date })
  }

  if (standing.entitled) {
    return t('billing.statusDetail.active', { product: productName })
  }

  return t('billing.statusDetail.choose', { product: productName })
}

export function profileBillingDiscountDisplay(
  read: SubscriptionDiscountRead | undefined,
  catalogMinor: BillingCatalogMinor | undefined,
): BillingDiscountDisplay {
  if (!read || !catalogMinor) return { kind: 'catalog' }
  return resolveBillingDiscountDisplay(read, catalogMinor)
}

/** Split catalog label into amount + interval for struck-through rewrite. */
export function splitCatalogPriceLabel(label: string): {
  amount: string
  interval: string
} {
  const match = label.match(/^(€[\d.,]+)\s*(.*)$/)
  if (!match) return { amount: label, interval: '' }
  const amount = match[1]
  const interval = match[2]
  if (amount == null || interval == null) {
    return { amount: label, interval: '' }
  }
  return { amount, interval }
}

export type PendingCouponTerms = {
  percentOff: number | null
  amountOff: number | null
}

/** Build a plan-card rewrite from pending coupon terms (pre-subscribe). */
export function buildPendingCouponRewrite(
  terms: PendingCouponTerms,
  catalogMinor: BillingCatalogMinor,
  prices: BillingPlanPriceLabels,
) {
  const discounted = buildDiscountedBillingPriceLabels(terms, catalogMinor)
  return {
    monthly: {
      discountedPrimary: discounted.monthlyAmount,
      listStrike: prices.monthlyLabel,
    },
    yearly: {
      discountedPrimary: discounted.yearlyAsMonthlyAmount,
      listStrike: prices.yearlyAsMonthlyLabel,
      discountedMuted: discounted.yearlyTotalAmount,
      listStrikeMuted: prices.yearlyTotalMutedLabel,
    },
  }
}

/** Assigned-variant list prices for plan cards (never expose variant names). */
export function billingCatalogPrices(
  catalog: BillingCatalogForUserRead | undefined,
): BillingPlanPrices | null {
  if (!catalog?.ok) return null
  return catalog.assigned.labels
}

/** Assigned-variant minor units for Discount rewrite math. */
export function billingCatalogMinor(
  catalog: BillingCatalogForUserRead | undefined,
): BillingCatalogMinor | undefined {
  if (!catalog?.ok) return undefined
  return catalog.assigned.minor
}

export function billingCatalogShowCompareAt(
  catalog: BillingCatalogForUserRead | undefined,
): boolean {
  return catalog?.ok === true && catalog.showCompareAt
}

export function billingCatalogBasicLabels(
  catalog: BillingCatalogForUserRead | undefined,
): BillingPlanPrices | null {
  if (!catalog?.ok) return null
  return catalog.basic.labels
}

export type BillingCompareAtPriceGroup = {
  primary: string
  secondary: string
}

export type BillingCompareAtMonthlyDiscountLine = {
  discounted: string
  /** Omitted while a separate struck basic row already shows the comparison. */
  current?: string
  interval: string
}

export type BillingCompareAtMonthlyRow =
  | { kind: 'catalog'; price: string }
  | { kind: 'discount-inline'; line: BillingCompareAtMonthlyDiscountLine }
  | { kind: 'struck'; price: string }

export type BillingCompareAtYearlyDiscountLine = {
  discounted: string
  /** Omitted while a separate struck basic row already shows the comparison. */
  current?: string
  interval: string
}

export type BillingCompareAtYearlyRow =
  | { kind: 'catalog'; lines: BillingCompareAtPriceGroup }
  | {
      kind: 'discount-inline'
      primary: BillingCompareAtYearlyDiscountLine
      secondary: BillingCompareAtYearlyDiscountLine
    }
  | { kind: 'struck'; lines: BillingCompareAtPriceGroup }

export type BillingCompareAtCardDisplay = {
  monthlyRows: BillingCompareAtMonthlyRow[]
  yearlyRows: BillingCompareAtYearlyRow[]
}

function yearlyGroupLines(
  labels: BillingPlanPriceLabels,
): BillingCompareAtPriceGroup {
  return {
    primary: labels.yearlyAsMonthlyLabel,
    secondary: labels.yearlyTotalMutedLabel,
  }
}

function buildMonthlyDiscountLine(
  discounted: DiscountedBillingPriceLabels,
  current: BillingPlanPriceLabels,
  includeCurrent: boolean,
): BillingCompareAtMonthlyDiscountLine {
  const { amount, interval } = splitCatalogPriceLabel(current.monthlyLabel)
  return {
    discounted: discounted.monthlyAmount,
    current: includeCurrent ? amount : undefined,
    interval,
  }
}

/** Same list price either side — comparing basic to itself is a no-op. */
function samePlanPriceLabels(
  a: BillingPlanPriceLabels,
  b: BillingPlanPriceLabels,
): boolean {
  return (
    a.monthlyLabel === b.monthlyLabel &&
    a.yearlyAsMonthlyLabel === b.yearlyAsMonthlyLabel &&
    a.yearlyTotalMutedLabel === b.yearlyTotalMutedLabel
  )
}

/**
 * Assigned-variant rows (optionally discounted), plus a struck basic
 * compare-at row when actually comparing against a different plan —
 * `showCompareAt` signals the assigned variant differs from basic, but the
 * live prices are re-checked here too so a seat that has reverted to basic
 * never ends up struck against itself. Pass `discountPrices` already
 * computed on assigned minor.
 *
 * While actively comparing against basic, the inline discount line drops
 * its own struck "current" amount — the separate struck-basic row below it
 * already carries that comparison, so showing both would strike the
 * assigned price twice.
 */
export function buildBillingCompareAtCardDisplay(input: {
  assigned: BillingPlanPriceLabels
  basic: BillingPlanPriceLabels
  showCompareAt: boolean
  discountPrices?: DiscountedBillingPriceLabels | null
}): BillingCompareAtCardDisplay {
  const { assigned, basic, showCompareAt, discountPrices } = input
  const comparesToBasic = showCompareAt && !samePlanPriceLabels(assigned, basic)

  if (discountPrices) {
    const includeCurrent = !comparesToBasic

    const monthlyRows: BillingCompareAtMonthlyRow[] = [
      {
        kind: 'discount-inline',
        line: buildMonthlyDiscountLine(
          discountPrices,
          assigned,
          includeCurrent,
        ),
      },
    ]
    if (comparesToBasic) {
      monthlyRows.push({ kind: 'struck', price: basic.monthlyLabel })
    }

    const yearlyAsMonthly = splitCatalogPriceLabel(
      assigned.yearlyAsMonthlyLabel,
    )
    const yearlyTotal = splitCatalogPriceLabel(assigned.yearlyTotalMutedLabel)
    const yearlyRows: BillingCompareAtYearlyRow[] = [
      {
        kind: 'discount-inline',
        primary: {
          discounted: discountPrices.yearlyAsMonthlyAmount,
          current: includeCurrent ? yearlyAsMonthly.amount : undefined,
          interval: yearlyAsMonthly.interval,
        },
        secondary: {
          discounted: discountPrices.yearlyTotalAmount,
          current: includeCurrent ? yearlyTotal.amount : undefined,
          interval: yearlyTotal.interval,
        },
      },
    ]
    if (comparesToBasic) {
      yearlyRows.push({ kind: 'struck', lines: yearlyGroupLines(basic) })
    }

    return { monthlyRows, yearlyRows }
  }

  if (!comparesToBasic) {
    return {
      monthlyRows: [{ kind: 'catalog', price: assigned.monthlyLabel }],
      yearlyRows: [{ kind: 'catalog', lines: yearlyGroupLines(assigned) }],
    }
  }

  return {
    monthlyRows: [
      { kind: 'catalog', price: assigned.monthlyLabel },
      { kind: 'struck', price: basic.monthlyLabel },
    ],
    yearlyRows: [
      { kind: 'catalog', lines: yearlyGroupLines(assigned) },
      { kind: 'struck', lines: yearlyGroupLines(basic) },
    ],
  }
}
