import { prisma } from '@virtality/db'
import type { PrismaClient } from '@virtality/db'
import { APIError } from 'better-auth/api'
import type Stripe from 'stripe'
import {
  evaluateTrialRedeemAtSignUp,
  grantActiveTrialToUser,
  issueFreeGrantToUser,
  redeemTrialCodeAfterSignUp,
  routeSignUpCode,
  TRIAL_REDEEM_SIGNUP_WAITLIST_MESSAGE,
  type ConsoleAccessCodeAccessGateIssuer,
  type TrialRedeemAccessGateIssuer,
  type TrialRedeemConsumeStore,
} from '@virtality/shared/utils'
import { createPrismaAccessGrantStore } from './access-grant-access.ts'
import { createAccessCodeVariantGateway } from './access-code-variant-adapter.ts'
import { consumeAccessCodeAndAssignDevices } from './provisioned-device-ownership.ts'

type AccessGrantStore = ReturnType<typeof createPrismaAccessGrantStore>

export function createAccessGateIssuerFromAccessGrantStore(
  store: AccessGrantStore,
): TrialRedeemAccessGateIssuer {
  return {
    issueFreeGrant: (input) => issueFreeGrantToUser(store, input),
    grantActiveTrial: (input) => grantActiveTrialToUser(store, input),
  }
}

export function createProfileAccessGateIssuerFromAccessGrantStore(
  store: AccessGrantStore,
): ConsoleAccessCodeAccessGateIssuer {
  return {
    ...createAccessGateIssuerFromAccessGrantStore(store),
    hasOpenGrantedAccessGate: async (userId) =>
      (await store.findOpenGrantedAccessGateByUserId(userId)) != null,
    hasOpenTimedAccessGate: async (userId) =>
      (await store.findOpenTimedAccessGateByUserId(userId)) != null,
  }
}

export function createPrismaTrialRedeemConsumeStore(
  client: PrismaClient = prisma,
  stripeClient: Stripe | null = null,
): TrialRedeemConsumeStore {
  // Every outcome that marks the code used also hands its Provisioned
  // Devices to the redeemer (ADR 0011).
  const consumeUnusedAs =
    (status: 'redeemed' | 'already_entitled') =>
    (id: number, usedBy: string, usedAt: Date) =>
      consumeAccessCodeAndAssignDevices(client, {
        id,
        status,
        usedBy,
        usedAt,
      })

  const variantGateway = createAccessCodeVariantGateway(client, stripeClient)
  const accessGrantStore = createPrismaAccessGrantStore(client)

  return {
    findByCode: (code) =>
      client.trialRedeemCode.findUnique({
        where: { code },
      }),
    consumeAsRedeemed: consumeUnusedAs('redeemed'),
    consumeAsAlreadyEntitled: consumeUnusedAs('already_entitled'),
    applyVariant: variantGateway.applyVariant,
    userHasLiveDefaultSubscription: (userId) =>
      accessGrantStore.userHasLiveDefaultSubscription(userId),
  }
}

export function createTrialRedeemAccessGateIssuer(
  client: PrismaClient = prisma,
): TrialRedeemAccessGateIssuer {
  return createAccessGateIssuerFromAccessGrantStore(
    createPrismaAccessGrantStore(client),
  )
}

/** @deprecated Use `createTrialRedeemAccessGateIssuer`. */
export const createAccessGrantIssuer = createTrialRedeemAccessGateIssuer

/** Reads the shared sign-up code field from email body or OAuth additionalData. */
export function readSignUpCodeFromUnknown(source: unknown): string | undefined {
  if (!source || typeof source !== 'object') return undefined
  const record = source as Record<string, unknown>
  const code = record.testerCode ?? record.re
  return typeof code === 'string' ? code : undefined
}

const trialRedeemStore = createPrismaTrialRedeemConsumeStore()

export async function assertTrialRedeemAllowedAtSignUp(
  rawCode: string | null | undefined,
): Promise<void> {
  const gate = await evaluateTrialRedeemAtSignUp(trialRedeemStore, rawCode)
  if (gate.action === 'block') {
    throw new APIError('BAD_REQUEST', { message: gate.message })
  }
  if (gate.action === 'waitlist') {
    throw new APIError('BAD_REQUEST', {
      message: TRIAL_REDEEM_SIGNUP_WAITLIST_MESSAGE,
    })
  }
}

export async function redeemTrialCodeForCustomer(input: {
  rawCode: string | null | undefined
  userId: string
  stripeClient?: Stripe | null
}): Promise<void> {
  const routed = routeSignUpCode(input.rawCode)
  if (routed.kind !== 'trial_redeem') return

  await redeemTrialCodeAfterSignUp(
    createPrismaTrialRedeemConsumeStore(prisma, input.stripeClient ?? null),
    createTrialRedeemAccessGateIssuer(),
    {
      code: routed.code,
      userId: input.userId,
    },
  )
}
