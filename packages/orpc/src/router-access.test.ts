import { call, isProcedure, ORPCError, type AnyProcedure } from '@orpc/server'
import { beforeAll, describe, expect, it } from 'vitest'
import { requireAdminRole } from './middleware/admin.ts'
import { requireAuth } from './middleware/auth.ts'

/**
 * Who may call each procedure. Anything not listed here is admin-only:
 * a clinician gets FORBIDDEN and a signed-out caller gets UNAUTHORIZED.
 *
 * Adding a procedure means deciding its access. Put it in PUBLIC only when
 * the website or a signed-out link needs it, and in SIGNED_IN only when the
 * console calls it. Adminboard-only procedures use `adminAuthed` and stay
 * off both lists.
 */
const PUBLIC: Record<string, string[]> = {
  blog: ['getPublishedBySlug', 'listPublished'],
  device: ['findByDeviceId'],
  email: [
    'optOuts.confirm',
    'optOuts.inspect',
    'optOuts.topics',
    'sendThankYouEmail',
  ],
  highlightCard: ['list'],
  mosaic: ['get'],
  partnerLogo: ['list'],
  pendingAccountDeletion: ['approve', 'inspect'],
  pendingPasswordChange: ['approve', 'inspect'],
  promoVideo: ['get'],
  translation: ['bundle'],
  waitlist: ['create'],
}

const SIGNED_IN: Record<string, string[]> = {
  account: ['list'],
  avatar: ['list'],
  bugReport: ['create'],
  consoleAccessCode: ['redeem'],
  consoleBilling: [
    'readCatalog',
    'scheduleCyclePlanChange',
    'startSubscribeCheckout',
  ],
  consolePromo: [
    'cancelPending',
    'readDiscount',
    'readPending',
    'redeem',
    'redeemPreflight',
    'remove',
    'savePending',
  ],
  device: ['create', 'delete', 'find', 'list', 'resetDeviceId'],
  devicePairing: ['cancel', 'start', 'status'],
  deviceVideo: [
    'applyEvent',
    'listForUser',
    'remove',
    'reportLibraryState',
    'requestDownload',
  ],
  entitlementClock: ['getStanding', 'markTrialWelcomeSeen'],
  exercise: ['list', 'listCategories', 'listItems'],
  favoriteExercise: ['add', 'list', 'remove'],
  immersiveVideo: ['list'],
  map: ['list'],
  me: [''],
  medicalHistory: ['create', 'find', 'list', 'update'],
  patient: ['create', 'delete', 'find', 'list', 'setPinned', 'update'],
  patientSession: [
    'complete',
    'create',
    'delete',
    'endImmersive',
    'find',
    'interrupt',
    'list',
    'listRecent',
    'startFromAck',
    'startImmersive',
    'syncWorkingCopy',
    'update',
  ],
  patientSessionData: ['create', 'upsertMany'],
  patientSessionExercise: ['createMany'],
  pendingAccountDeletion: ['cancel', 'getActive', 'resend', 'start'],
  pendingPasswordChange: [
    'cancel',
    'getActive',
    'resend',
    'startChange',
    'startSetup',
  ],
  productEvent: ['track'],
  renewPrompt: ['evaluate', 'listInApp'],
  reusableProgram: [
    'copy',
    'create',
    'find',
    'list',
    'listStarterTemplates',
    'retire',
    'update',
  ],
  reusableProgramExercise: ['createMany', 'updateMany'],
  supplementalTherapy: ['createRel', 'list'],
  user: [
    'findUsername',
    'hasPassword',
    'isUserVerified',
    'updateEmail',
    'updateInfo',
  ],
}

function flatten(groups: Record<string, string[]>): Set<string> {
  return new Set(
    Object.entries(groups).flatMap(([namespace, names]) =>
      names.map((name) => (name ? `${namespace}.${name}` : namespace)),
    ),
  )
}

const publicPaths = flatten(PUBLIC)
const signedInPaths = flatten(SIGNED_IN)

function collectProcedures(
  node: unknown,
  path: string[] = [],
): [string, AnyProcedure][] {
  if (isProcedure(node)) {
    return [[path.join('.'), node]]
  }
  if (node === null || typeof node !== 'object') {
    return []
  }
  return Object.entries(node).flatMap(([key, child]) =>
    collectProcedures(child, [...path, key]),
  )
}

function middlewaresOf(procedure: AnyProcedure): readonly unknown[] {
  return procedure['~orpc'].middlewares
}

/** Fails the test if a handler runs: the access check must stop the call first. */
const unreachablePrisma = new Proxy(
  {},
  {
    get(_target, property) {
      throw new Error(`handler reached prisma.${String(property)}`)
    },
  },
)

function contextFor(role: 'admin' | 'user' | null) {
  return {
    headers: new Headers(),
    user: role ? { id: 'user-1', role } : null,
    session: role ? { id: 'session-1' } : null,
    prisma: unreachablePrisma,
  } as never
}

async function errorCodeOf(
  procedure: AnyProcedure,
  role: 'admin' | 'user' | null,
): Promise<string> {
  try {
    await call(procedure, undefined, { context: contextFor(role) })
  } catch (error) {
    return error instanceof ORPCError ? error.code : 'handler ran'
  }
  return 'handler ran'
}

let procedures: [string, AnyProcedure][] = []

beforeAll(async () => {
  // Modules behind the router read these at import time.
  process.env.CDN_URL ??= 'https://cdn.example.test'
  process.env.SMTP_HOST ??= 'smtp.example.test'
  process.env.SMTP_USER ??= 'test'
  process.env.SMTP_PASS ??= 'test'
  const { router } = await import('./router.ts')
  procedures = collectProcedures(router)
})

describe('router access', () => {
  it('lists only procedures that exist', () => {
    const existing = new Set(procedures.map(([path]) => path))
    const stale = [...publicPaths, ...signedInPaths].filter(
      (path) => !existing.has(path),
    )
    expect(stale).toEqual([])
  })

  it('builds public procedures without auth and signed-in ones with auth only', () => {
    const mismatched = procedures
      .filter(([path]) => publicPaths.has(path) || signedInPaths.has(path))
      .filter(([path, procedure]) => {
        const middlewares = middlewaresOf(procedure)
        const isAuthed = middlewares.includes(requireAuth)
        const isAdmin = middlewares.includes(requireAdminRole)
        return publicPaths.has(path)
          ? isAuthed || isAdmin
          : !isAuthed || isAdmin
      })
      .map(([path]) => path)
    expect(mismatched).toEqual([])
  })

  it('turns clinicians away from every other procedure with FORBIDDEN', async () => {
    const adminOnly = procedures.filter(
      ([path]) => !publicPaths.has(path) && !signedInPaths.has(path),
    )
    expect(adminOnly.length).toBeGreaterThan(0)

    const leaks: string[] = []
    for (const [path, procedure] of adminOnly) {
      const code = await errorCodeOf(procedure, 'user')
      if (code !== 'FORBIDDEN') leaks.push(`${path} -> ${code}`)
    }
    expect(leaks).toEqual([])
  })

  it('turns signed-out callers away from every other procedure with UNAUTHORIZED', async () => {
    const adminOnly = procedures.filter(
      ([path]) => !publicPaths.has(path) && !signedInPaths.has(path),
    )

    const leaks: string[] = []
    for (const [path, procedure] of adminOnly) {
      const code = await errorCodeOf(procedure, null)
      if (code !== 'UNAUTHORIZED') {
        leaks.push(`${path} -> ${code}`)
      }
    }
    expect(leaks).toEqual([])
  })

  it('lets an admin through to the handler', async () => {
    const [, waitlistList] = procedures.find(
      ([path]) => path === 'waitlist.list',
    )!
    await expect(
      call(waitlistList, undefined, { context: contextFor('admin') }),
    ).rejects.toThrow('handler reached prisma.waitingList')
  })
})
