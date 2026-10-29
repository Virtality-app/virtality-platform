import { describe, expect, it } from 'vitest'
import {
  buildBillingPlanPriceLabels,
  FREE_SUBSCRIPTION_PLAN,
  DEFAULT_BILLING_CATALOG_SANDBOX,
  DEFAULT_SUBSCRIPTION_PLAN,
} from '@virtality/shared/utils'
import { createCatalogTranslate } from '@/i18n/catalog-translate'
import {
  buildPendingCouponRewrite,
  buildBillingCompareAtCardDisplay,
  profileBillingDiscountDisplay,
  profileBillingOpensPortal,
  profileBillingPrimaryCtaLabel,
  profileBillingSchedulesAtPeriodEnd,
  profileBillingShowsPlanCardCheckout,
  profileBillingIsLapsedAccessGateTrial,
  profileBillingStatusDetail,
  profileBillingStatusHeadline,
  resolveProfileBillingCardAction,
  splitCatalogPriceLabel,
  type BillingCopy,
  type BillingStandingView,
  profileBillingPendingCancellationBanner,
  profileBillingPendingPlanChangeBanner,
} from './profile-billing.js'

const copy: BillingCopy = { t: createCatalogTranslate('user'), locale: 'en' }

const base: BillingStandingView = {
  entitled: false,
  status: null,
  plan: null,
  billingPathEstablished: false,
  hadPaidBilling: false,
  billingInterval: null,
  clockEnd: null,
  hasPendingPlanChange: false,
  cancelAtPeriodEnd: false,
}

describe('profileBillingPrimaryCtaLabel', () => {
  it('shows Manage billing only for entitled paid Default seats', () => {
    expect(
      profileBillingPrimaryCtaLabel(copy, {
        ...base,
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
      }),
    ).toBe('Manage billing')
  })

  it('hides the centralized CTA for Free and trialing clinicians', () => {
    expect(
      profileBillingPrimaryCtaLabel(copy, {
        ...base,
        entitled: true,
        status: 'trialing',
        plan: FREE_SUBSCRIPTION_PLAN,
        billingPathEstablished: true,
      }),
    ).toBeNull()
    expect(profileBillingPrimaryCtaLabel(copy, base)).toBeNull()
  })
})

describe('profileBillingOpensPortal', () => {
  it('is true only for entitled paid Default subscriptions', () => {
    expect(
      profileBillingOpensPortal({
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
      }),
    ).toBe(true)
    expect(
      profileBillingOpensPortal({
        entitled: true,
        status: 'trialing',
        plan: FREE_SUBSCRIPTION_PLAN,
      }),
    ).toBe(false)
    expect(
      profileBillingOpensPortal({
        entitled: false,
        status: 'active',
        plan: FREE_SUBSCRIPTION_PLAN,
      }),
    ).toBe(false)
  })
})

describe('profileBillingShowsPlanCardCheckout', () => {
  it('offers Checkout on plan cards for Free and trialing clinicians', () => {
    expect(
      profileBillingShowsPlanCardCheckout(
        {
          ...base,
          entitled: true,
          status: 'trialing',
          plan: FREE_SUBSCRIPTION_PLAN,
          billingPathEstablished: true,
        },
        true,
      ),
    ).toBe(true)
    expect(
      profileBillingShowsPlanCardCheckout(
        {
          ...base,
          entitled: false,
          status: 'active',
          plan: FREE_SUBSCRIPTION_PLAN,
          billingPathEstablished: true,
        },
        true,
      ),
    ).toBe(true)
  })

  it('offers plan-card actions for entitled paid Default seats (interval switch)', () => {
    expect(
      profileBillingShowsPlanCardCheckout(
        {
          ...base,
          entitled: true,
          status: 'active',
          plan: DEFAULT_SUBSCRIPTION_PLAN,
        },
        true,
      ),
    ).toBe(true)
  })
})

describe('resolveProfileBillingCardAction', () => {
  it('uses Subscribe checkout when a Customer exists without Billing Path', () => {
    expect(resolveProfileBillingCardAction(copy, base, true, 'month')).toEqual({
      kind: 'checkout',
      label: 'Subscribe',
      pendingLabel: 'Starting Checkout…',
    })
  })

  it('uses Subscribe checkout after Billing Path without paid history', () => {
    expect(
      resolveProfileBillingCardAction(
        copy,
        { ...base, billingPathEstablished: true },
        true,
        'year',
      ),
    ).toEqual({
      kind: 'checkout',
      label: 'Subscribe',
      pendingLabel: 'Starting Checkout…',
    })
  })

  it('uses Renew checkout after paid history', () => {
    expect(
      resolveProfileBillingCardAction(
        copy,
        {
          ...base,
          billingPathEstablished: true,
          hadPaidBilling: true,
        },
        true,
        'month',
      ),
    ).toEqual({
      kind: 'checkout',
      label: 'Renew',
      pendingLabel: 'Starting Checkout…',
    })
  })

  it('uses Subscribe checkout when no Stripe Customer is linked', () => {
    expect(resolveProfileBillingCardAction(copy, base, false, 'month')).toEqual(
      {
        kind: 'checkout',
        label: 'Subscribe',
        pendingLabel: 'Starting Checkout…',
      },
    )
  })

  it('schedules Upgrade on the other paid Default interval with confirm copy', () => {
    const standing: BillingStandingView = {
      ...base,
      entitled: true,
      status: 'active',
      plan: DEFAULT_SUBSCRIPTION_PLAN,
      billingInterval: 'month',
      clockEnd: '2026-09-10T12:00:00.000Z',
    }
    expect(
      resolveProfileBillingCardAction(copy, standing, true, 'month'),
    ).toEqual({
      kind: 'active',
      label: 'Active',
      pendingLabel: 'Active',
    })
    const year = resolveProfileBillingCardAction(copy, standing, true, 'year')
    expect(year.kind).toBe('schedule')
    expect(year.label).toBe('Upgrade')
    expect(year.pendingLabel).toBe('Upgrading…')
    expect(year).toMatchObject({
      confirm: {
        title: 'Switch to Yearly?',
        confirmLabel: 'Upgrade',
      },
    })
    expect(year.kind === 'schedule' && year.confirm.body).toMatch(
      /Payment starts at your next billing cycle/,
    )
  })

  it('cancels the scheduled switch on the target interval with confirm copy', () => {
    const standing: BillingStandingView = {
      ...base,
      entitled: true,
      status: 'active',
      plan: DEFAULT_SUBSCRIPTION_PLAN,
      billingInterval: 'month',
      hasPendingPlanChange: true,
      clockEnd: '2026-09-10T12:00:00.000Z',
    }
    expect(
      resolveProfileBillingCardAction(copy, standing, true, 'month'),
    ).toEqual({
      kind: 'active',
      label: 'Active',
      pendingLabel: 'Active',
    })
    expect(
      resolveProfileBillingCardAction(copy, standing, true, 'year'),
    ).toEqual({
      kind: 'cancel_schedule',
      label: 'Cancel Upgrade',
      pendingLabel: 'Canceling…',
      confirm: {
        title: 'Cancel switch to Yearly?',
        body: "You'll stay on your current plan and renew as usual.",
        confirmLabel: 'Cancel Upgrade',
      },
    })
  })

  it('schedules Downgrade on the other paid Default interval from a Yearly seat', () => {
    const standing: BillingStandingView = {
      ...base,
      entitled: true,
      status: 'active',
      plan: DEFAULT_SUBSCRIPTION_PLAN,
      billingInterval: 'year',
      clockEnd: '2026-09-10T12:00:00.000Z',
    }
    const month = resolveProfileBillingCardAction(copy, standing, true, 'month')
    expect(month.kind).toBe('schedule')
    expect(month.label).toBe('Downgrade')
    expect(month.pendingLabel).toBe('Downgrading…')
  })

  it('cancels a scheduled Downgrade with direction-aware copy', () => {
    const standing: BillingStandingView = {
      ...base,
      entitled: true,
      status: 'active',
      plan: DEFAULT_SUBSCRIPTION_PLAN,
      billingInterval: 'year',
      hasPendingPlanChange: true,
      clockEnd: '2026-09-10T12:00:00.000Z',
    }
    expect(
      resolveProfileBillingCardAction(copy, standing, true, 'month'),
    ).toEqual({
      kind: 'cancel_schedule',
      label: 'Cancel Downgrade',
      pendingLabel: 'Canceling…',
      confirm: {
        title: 'Cancel switch to Monthly?',
        body: "You'll stay on your current plan and renew as usual.",
        confirmLabel: 'Cancel Downgrade',
      },
    })
  })

  it('restores cancellation on the active interval and checkouts Upgrade on the other when cancel-at-period-end', () => {
    const standing: BillingStandingView = {
      ...base,
      entitled: true,
      status: 'active',
      plan: DEFAULT_SUBSCRIPTION_PLAN,
      billingInterval: 'month',
      cancelAtPeriodEnd: true,
      clockEnd: '2026-09-10T12:00:00.000Z',
    }
    expect(
      resolveProfileBillingCardAction(copy, standing, true, 'month'),
    ).toEqual({
      kind: 'restore_cancellation',
      label: "Don't cancel",
      pendingLabel: 'Restoring…',
    })
    expect(
      resolveProfileBillingCardAction(copy, standing, true, 'year'),
    ).toEqual({
      kind: 'checkout',
      label: 'Upgrade',
      pendingLabel: 'Upgrading…',
    })
  })
})

describe('profileBillingPendingPlanChangeBanner', () => {
  it('names the target plan and renewal when a switch is scheduled', () => {
    const banner = profileBillingPendingPlanChangeBanner(copy, {
      ...base,
      entitled: true,
      status: 'active',
      plan: DEFAULT_SUBSCRIPTION_PLAN,
      billingInterval: 'month',
      hasPendingPlanChange: true,
      clockEnd: '2026-09-10T12:00:00.000Z',
    })
    expect(banner).toMatch(/Switching to Yearly/)
    expect(banner).toMatch(/Payment starts/)
  })
})

describe('profileBillingPendingCancellationBanner', () => {
  it('warns that access ends at the next cycle', () => {
    const banner = profileBillingPendingCancellationBanner(copy, {
      ...base,
      entitled: true,
      status: 'active',
      plan: DEFAULT_SUBSCRIPTION_PLAN,
      billingInterval: 'month',
      cancelAtPeriodEnd: true,
      clockEnd: '2026-09-10T12:00:00.000Z',
    })
    expect(banner).toMatch(/subscription ends/)
    expect(banner).toMatch(/keep Default access/i)
  })

  it('is absent when cancel-at-period-end is not scheduled', () => {
    expect(
      profileBillingPendingCancellationBanner(copy, {
        ...base,
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
        billingInterval: 'month',
        clockEnd: '2026-09-10T12:00:00.000Z',
      }),
    ).toBeNull()
  })
})

describe('profileBillingSchedulesAtPeriodEnd', () => {
  it('is true only for live paid Default seats that are not canceling', () => {
    expect(
      profileBillingSchedulesAtPeriodEnd({
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
        cancelAtPeriodEnd: false,
      }),
    ).toBe(true)
    expect(
      profileBillingSchedulesAtPeriodEnd({
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
        cancelAtPeriodEnd: true,
      }),
    ).toBe(false)
    expect(
      profileBillingSchedulesAtPeriodEnd({
        entitled: true,
        status: 'trialing',
        plan: FREE_SUBSCRIPTION_PLAN,
        cancelAtPeriodEnd: false,
      }),
    ).toBe(false)
  })
})

describe('profileBillingIsLapsedAccessGateTrial', () => {
  it('is true when an Access Gate trial clock has ended', () => {
    expect(
      profileBillingIsLapsedAccessGateTrial({
        entitled: false,
        status: 'trialing',
      }),
    ).toBe(true)
  })

  it('is false for live trials and non-trial standings', () => {
    expect(
      profileBillingIsLapsedAccessGateTrial({
        entitled: true,
        status: 'trialing',
      }),
    ).toBe(false)
    expect(
      profileBillingIsLapsedAccessGateTrial({
        entitled: false,
        status: 'active',
      }),
    ).toBe(false)
    expect(
      profileBillingIsLapsedAccessGateTrial({
        entitled: false,
        status: null,
      }),
    ).toBe(false)
  })
})

describe('profileBillingStatusHeadline', () => {
  it('describes active, trial, and empty seats', () => {
    expect(
      profileBillingStatusHeadline(copy, {
        ...base,
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
        billingInterval: 'year',
      }),
    ).toBe('Default · Yearly')
    expect(
      profileBillingStatusHeadline(copy, {
        ...base,
        entitled: true,
        status: 'trialing',
        plan: null,
      }),
    ).toBe('Trial in progress')
    expect(
      profileBillingStatusHeadline(copy, {
        ...base,
        entitled: false,
        status: 'trialing',
        plan: null,
      }),
    ).toBe('Expired')
    expect(profileBillingStatusHeadline(copy, base)).toBe('No plan')
  })

  it('groups granted and revoked Access Gates with no gate as No plan', () => {
    expect(
      profileBillingStatusHeadline(copy, {
        ...base,
        entitled: false,
        status: 'granted',
        plan: null,
      }),
    ).toBe('No plan')
    expect(
      profileBillingStatusHeadline(copy, {
        ...base,
        entitled: false,
        status: 'revoked',
        plan: null,
      }),
    ).toBe('No plan')
  })
})

describe('profileBillingStatusDetail', () => {
  it('prompts interval choice when there is no live clock', () => {
    expect(profileBillingStatusDetail(copy, base)).toMatch(/Monthly or Annual/)
  })

  it('uses the generic checkout prompt for lapsed Access Gate trials', () => {
    const detail = profileBillingStatusDetail(copy, {
      ...base,
      entitled: false,
      status: 'trialing',
      plan: null,
    })

    expect(detail).toMatch(/Monthly or Annual/)
    expect(detail).not.toMatch(/Free plan/)
  })

  it('mentions the scheduled target plan beside the renewal date', () => {
    expect(
      profileBillingStatusDetail(copy, {
        ...base,
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
        billingInterval: 'month',
        hasPendingPlanChange: true,
        clockEnd: '2026-09-10T12:00:00.000Z',
      }),
    ).toMatch(/switching to Yearly/)
  })

  it('says Ends when cancel-at-period-end is scheduled', () => {
    expect(
      profileBillingStatusDetail(copy, {
        ...base,
        entitled: true,
        status: 'active',
        plan: DEFAULT_SUBSCRIPTION_PLAN,
        billingInterval: 'month',
        cancelAtPeriodEnd: true,
        clockEnd: '2026-09-10T12:00:00.000Z',
      }),
    ).toMatch(/^Ends /)
  })
})

describe('profileBillingDiscountDisplay', () => {
  it('rewrites when a healthy Discount is present', () => {
    expect(
      profileBillingDiscountDisplay(
        {
          ok: true,
          presence: 'one',
          channel: 'promo',
          discountId: 'di_1',
          couponId: 'cou_1',
          couponName: 'Spring',
          promotionCodeId: 'promo_1',
          promotionCode: 'SPRING20',
          start: 1,
          end: null,
          percentOff: 20,
          amountOff: null,
          currency: null,
          duration: 'once',
          durationInMonths: null,
        },
        DEFAULT_BILLING_CATALOG_SANDBOX,
      ),
    ).toEqual({
      kind: 'rewrite',
      prices: {
        monthlyAmount: '€120',
        yearlyAsMonthlyAmount: '€100',
        yearlyTotalAmount: '€1200',
      },
    })
  })

  it('soft-unavailables when Discount terms are missing', () => {
    expect(
      profileBillingDiscountDisplay(
        {
          ok: false,
          reason: 'stripe_unavailable',
        },
        DEFAULT_BILLING_CATALOG_SANDBOX,
      ),
    ).toEqual({ kind: 'soft_unavailable' })
  })
})

describe('buildPendingCouponRewrite', () => {
  const prices = buildBillingPlanPriceLabels(DEFAULT_BILLING_CATALOG_SANDBOX)

  it('rewrites plan card prices from pending coupon percent-off terms', () => {
    const rewrite = buildPendingCouponRewrite(
      { percentOff: 20, amountOff: null },
      DEFAULT_BILLING_CATALOG_SANDBOX,
      prices,
    )

    expect(rewrite.monthly.discountedPrimary).toBe('€120')
    expect(rewrite.monthly.listStrike).toBe(prices.monthlyLabel)
    expect(rewrite.yearly.discountedPrimary).toBe('€100')
    expect(rewrite.yearly.listStrike).toBe(prices.yearlyAsMonthlyLabel)
    expect(rewrite.yearly.discountedMuted).toBe('€1200')
    expect(rewrite.yearly.listStrikeMuted).toBe(prices.yearlyTotalMutedLabel)
  })

  it('rewrites plan card prices from pending coupon amount-off terms', () => {
    const rewrite = buildPendingCouponRewrite(
      { percentOff: null, amountOff: 5000 },
      DEFAULT_BILLING_CATALOG_SANDBOX,
      prices,
    )

    expect(rewrite.monthly.discountedPrimary).toBe('€100')
    expect(rewrite.yearly.discountedMuted).toBe('€1450')
  })
})

describe('splitCatalogPriceLabel', () => {
  it('keeps interval outside the struck catalog amount', () => {
    expect(splitCatalogPriceLabel('€150 / month')).toEqual({
      amount: '€150',
      interval: '/ month',
    })
  })

  it('keeps "billed annually" outside the struck yearly total amount', () => {
    expect(splitCatalogPriceLabel('€1500 billed annually')).toEqual({
      amount: '€1500',
      interval: 'billed annually',
    })
  })
})

describe('buildBillingCompareAtCardDisplay', () => {
  const basic = buildBillingPlanPriceLabels(DEFAULT_BILLING_CATALOG_SANDBOX)
  const assigned = buildBillingPlanPriceLabels({
    monthly: 9_900,
    yearly: 99_000,
  })

  it('shows a single clean catalog row for basic seats', () => {
    const card = buildBillingCompareAtCardDisplay({
      assigned: basic,
      basic,
      showCompareAt: false,
    })
    expect(card.monthlyRows).toEqual([
      { kind: 'catalog', price: basic.monthlyLabel },
    ])
    expect(card.yearlyRows).toHaveLength(1)
    expect(card.yearlyRows[0]?.kind).toBe('catalog')
  })

  it('stacks assigned then struck basic when showCompareAt', () => {
    const card = buildBillingCompareAtCardDisplay({
      assigned,
      basic,
      showCompareAt: true,
    })
    expect(card.monthlyRows).toEqual([
      { kind: 'catalog', price: assigned.monthlyLabel },
      { kind: 'struck', price: basic.monthlyLabel },
    ])
    expect(card.yearlyRows[0]).toMatchObject({ kind: 'catalog' })
    expect(card.yearlyRows[1]).toMatchObject({
      kind: 'struck',
      lines: {
        primary: basic.yearlyAsMonthlyLabel,
        secondary: basic.yearlyTotalMutedLabel,
      },
    })
  })

  it('never strikes basic against itself even when showCompareAt is stale', () => {
    const card = buildBillingCompareAtCardDisplay({
      assigned: basic,
      basic,
      showCompareAt: true,
    })
    expect(card.monthlyRows).toEqual([
      { kind: 'catalog', price: basic.monthlyLabel },
    ])
    expect(card.yearlyRows).toEqual([
      {
        kind: 'catalog',
        lines: {
          primary: basic.yearlyAsMonthlyLabel,
          secondary: basic.yearlyTotalMutedLabel,
        },
      },
    ])
  })

  it('never strikes a discounted basic seat against itself even when showCompareAt is stale', () => {
    const discountPrices = {
      monthlyAmount: '€120',
      yearlyAsMonthlyAmount: '€100',
      yearlyTotalAmount: '€1200',
    }
    const card = buildBillingCompareAtCardDisplay({
      assigned: basic,
      basic,
      showCompareAt: true,
      discountPrices,
    })
    expect(card.monthlyRows).toEqual([
      {
        kind: 'discount-inline',
        line: {
          discounted: discountPrices.monthlyAmount,
          current: splitCatalogPriceLabel(basic.monthlyLabel).amount,
          interval: splitCatalogPriceLabel(basic.monthlyLabel).interval,
        },
      },
    ])
  })

  it('drops the inline struck current price while showCompareAt, keeping the separate struck basic row', () => {
    const discountPrices = {
      monthlyAmount: '€79.20',
      yearlyAsMonthlyAmount: '€66',
      yearlyTotalAmount: '€792',
    }
    const card = buildBillingCompareAtCardDisplay({
      assigned,
      basic,
      showCompareAt: true,
      discountPrices,
    })
    expect(card.monthlyRows[0]).toMatchObject({
      kind: 'discount-inline',
      line: {
        discounted: discountPrices.monthlyAmount,
        current: undefined,
      },
    })
    expect(card.monthlyRows[1]).toEqual({
      kind: 'struck',
      price: basic.monthlyLabel,
    })
    expect(card.yearlyRows[0]).toMatchObject({
      kind: 'discount-inline',
      secondary: {
        discounted: discountPrices.yearlyTotalAmount,
        current: undefined,
      },
    })
    expect(card.yearlyRows[1]).toMatchObject({
      kind: 'struck',
      lines: {
        primary: basic.yearlyAsMonthlyLabel,
        secondary: basic.yearlyTotalMutedLabel,
      },
    })
  })

  it('keeps the inline struck current price when not showCompareAt', () => {
    const discountPrices = {
      monthlyAmount: '€79.20',
      yearlyAsMonthlyAmount: '€66',
      yearlyTotalAmount: '€792',
    }
    const card = buildBillingCompareAtCardDisplay({
      assigned,
      basic,
      showCompareAt: false,
      discountPrices,
    })
    expect(card.monthlyRows).toHaveLength(1)
    expect(card.monthlyRows[0]).toMatchObject({
      kind: 'discount-inline',
      line: {
        discounted: discountPrices.monthlyAmount,
        current: splitCatalogPriceLabel(assigned.monthlyLabel).amount,
      },
    })
  })
})

describe('billing copy with Greek selected', () => {
  const el: BillingCopy = {
    t: createCatalogTranslate('user', 'el'),
    locale: 'el',
  }
  const paidYearly: BillingStandingView = {
    ...base,
    entitled: true,
    status: 'active',
    plan: DEFAULT_SUBSCRIPTION_PLAN,
    billingInterval: 'year',
    clockEnd: '2026-11-05T09:30:00Z',
  }

  it('words the status headline and detail in Greek', () => {
    expect(profileBillingStatusHeadline(el, paidYearly, 'Pro')).toBe(
      'Pro · Ετήσιο',
    )
    expect(profileBillingStatusDetail(el, paidYearly)).toMatch(
      /^Ανανεώνεται 5 Νοε 2026/,
    )
  })

  it('words plan-card actions in Greek', () => {
    expect(
      resolveProfileBillingCardAction(el, paidYearly, true, 'month'),
    ).toMatchObject({ kind: 'schedule', label: 'Υποβάθμιση' })
  })

  it('words the pending cancellation banner in Greek', () => {
    expect(
      profileBillingPendingCancellationBanner(
        el,
        { ...paidYearly, cancelAtPeriodEnd: true },
        'Pro',
      ),
    ).toMatch(/^Η συνδρομή σας λήγει στις 5 Νοε 2026/)
  })
})
