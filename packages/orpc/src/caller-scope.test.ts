import { call, isProcedure, ORPCError, type AnyProcedure } from '@orpc/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { requireAdminRole } from './middleware/admin.ts'
import { requireAuth } from './middleware/auth.ts'
import { createInMemoryPrisma } from './testing/in-memory-prisma.ts'

/**
 * Every signed-in (console) procedure that takes a record id must refuse an
 * id another clinician owns. Each case runs twice on fresh data: as
 * clinician B against clinician A's record, which must be refused with
 * nothing changed, and as A, which must get through. The second run proves
 * the refusal comes from the ownership check and not from bad test data.
 */

const A = 'clinician-a'
const B = 'clinician-b'
const t0 = new Date('2026-11-01T09:00:00Z')

const patientRow = (id: string, userId: string) => ({
  id,
  userId,
  name: `Patient ${id}`,
  email: null,
  phone: null,
  dob: null,
  sex: null,
  weight: null,
  height: null,
  occupation: null,
  language: 'English',
  image: null,
  createdAt: t0,
  updatedAt: t0,
  deletedAt: null,
  pinnedAt: null,
})

const historyRow = (id: string, patientId: string) => ({
  id,
  patientId,
  anamneses: null,
  complaints: null,
  expectations: null,
  diagnosis: null,
  nprs: null,
  bodyFront: null,
  bodyBack: null,
  deltas: null,
})

const sessionRow = (
  id: string,
  patientId: string,
  extra: Record<string, unknown> = {},
) => ({
  id,
  patientId,
  programId: null,
  status: 'ACTIVE',
  kind: 'EXERCISE',
  sourceReusableProgramId: null,
  sourceProgramName: null,
  nprs: null,
  notes: null,
  createdAt: t0,
  completedAt: null,
  deletedAt: null,
  ...extra,
})

const sessionExerciseRow = (id: string, patientSessionId: string) => ({
  id,
  patientSessionId,
  exerciseId: 'exercise-1',
  position: 0,
  sets: 3,
  reps: 10,
  restTime: 5,
  holdTime: 1,
  speed: 1,
})

const programExerciseRow = (id: string, reusableProgramId: string) => ({
  id,
  reusableProgramId,
  exerciseId: 'exercise-1',
  position: 0,
  sets: 3,
  reps: 10,
  restTime: 5,
  holdTime: 1,
  speed: 1,
})

const deviceRow = (id: string, userId: string, deviceId: string | null) => ({
  id,
  userId,
  accessCodeId: null,
  deviceId,
  model: null,
  lastUsed: t0,
  createdAt: t0,
  deletedAt: null,
  name: `Headset ${id}`,
})

function seed() {
  return {
    user: [
      { id: A, email: 'a@clinic.test', emailVerified: true, deletedAt: null },
      { id: B, email: 'b@clinic.test', emailVerified: true, deletedAt: null },
    ],
    patient: [patientRow('patient-a', A), patientRow('patient-b', B)],
    medicalHistory: [
      historyRow('history-a', 'patient-a'),
      historyRow('history-b', 'patient-b'),
    ],
    patientSession: [
      sessionRow('session-a-active', 'patient-a'),
      sessionRow('session-a-done', 'patient-a', {
        status: 'COMPLETED',
        completedAt: t0,
      }),
      sessionRow('session-a-video', 'patient-a', { kind: 'IMMERSIVE_VIDEO' }),
      sessionRow('session-b-active', 'patient-b'),
    ],
    sessionExercise: [
      sessionExerciseRow('session-exercise-a', 'session-a-active'),
      sessionExerciseRow('session-exercise-b', 'session-b-active'),
    ],
    sessionImmersiveVideo: [
      {
        id: 'video-run-a',
        patientSessionId: 'session-a-video',
        immersiveVideoId: 'video-1',
        videoTitle: 'Forest walk',
        activity: 'WALKING',
        videoDurationSec: 600,
        startedAt: t0,
        endedAt: null,
        lastPositionSec: null,
        endReason: null,
      },
    ],
    immersiveVideo: [
      {
        id: 'video-1',
        title: 'Forest walk',
        activity: 'WALKING',
        durationSec: 600,
      },
    ],
    exercise: [{ id: 'exercise-1', enabled: true }],
    supplementalTherapy: [{ id: 'therapy-1', name: 'Ice' }],
    reusableProgram: [
      {
        id: 'program-a',
        name: 'Knee rehab',
        kind: 'CLINICIAN_OWNED',
        userId: A,
        createdAt: t0,
        updatedAt: t0,
        retiredAt: null,
      },
    ],
    reusableProgramExercise: [
      programExerciseRow('program-exercise-a', 'program-a'),
    ],
    device: [
      deviceRow('device-a', A, 'headset-a'),
      deviceRow('device-a-unpaired', A, null),
    ],
    devicePairingAttempt: [
      {
        id: 'attempt-a',
        deviceRecordId: 'device-a-unpaired',
        userId: A,
        code: '123456',
        activeCode: '123456',
        activeDeviceKey: 'device-a-unpaired',
        status: 'PENDING',
        headsetDeviceId: null,
        expiresAt: new Date(Date.now() + 10 * 60_000),
        createdAt: new Date(),
        completedAt: null,
        cancelledAt: null,
        supersededAt: null,
        expiredAt: null,
      },
    ],
    favoriteExercise: [
      { id: 'favorite-a', exerciseId: 'exercise-1', userId: A },
    ],
  }
}

/** Nothing for the caller: an empty read is a refusal too. */
type Refusal = 'NOT_FOUND' | 'FORBIDDEN' | 'nothing'

type Case = {
  path: string
  /** Names the record, owned by clinician A, that B goes after. */
  name: string
  input: unknown
  refusal: Refusal
  /**
   * The run that must get through. Defaults to clinician A with the same
   * input; a case that mixes A's id into B's own record uses B with B's id.
   */
  control?: { userId: string; input: unknown }
}

const { patient: _seedPatients } = seed()
const patientA = _seedPatients[0]!
const history = (id: string, patientId: string) => historyRow(id, patientId)

const CASES: Case[] = [
  {
    path: 'patient.find',
    name: "A's patient",
    input: { id: 'patient-a' },
    refusal: 'nothing',
  },
  {
    path: 'patient.list',
    name: "a filter naming A's patient",
    input: { where: { userId: A } },
    refusal: 'nothing',
  },
  {
    path: 'patient.update',
    name: "A's patient",
    input: {
      data: {
        patient: { ...patientA, userId: undefined, name: 'Renamed' },
        medicalHistory: history('history-a', 'patient-a'),
      },
    },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patient.update',
    name: "A's medical history, through B's own patient",
    input: {
      data: {
        patient: { ...patientRow('patient-b', B), userId: undefined },
        medicalHistory: history('history-a', 'patient-b'),
      },
    },
    refusal: 'NOT_FOUND',
    control: {
      userId: B,
      input: {
        data: {
          patient: { ...patientRow('patient-b', B), userId: undefined },
          medicalHistory: history('history-b', 'patient-b'),
        },
      },
    },
  },
  {
    path: 'patient.delete',
    name: "A's patient",
    input: { id: 'patient-a' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patient.setPinned',
    name: "A's patient",
    input: { id: 'patient-a', pinned: true },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'medicalHistory.find',
    name: "A's patient's history",
    input: { where: { patientId: 'patient-a' } },
    refusal: 'nothing',
  },
  {
    path: 'patientSession.list',
    name: "A's patient's sessions",
    input: { where: { patientId: 'patient-a' } },
    refusal: 'nothing',
  },
  {
    path: 'patientSession.find',
    name: "A's session",
    input: { where: { id: 'session-a-done' } },
    refusal: 'nothing',
  },
  {
    path: 'patientSession.update',
    name: "A's session notes",
    input: { id: 'session-a-done', notes: 'Edited' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSession.delete',
    name: "A's session",
    input: { id: 'session-a-done' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSession.startFromAck',
    name: "a session for A's patient",
    input: {
      session: sessionRow('session-new', 'patient-a'),
      exercises: [
        {
          ...sessionExerciseRow('session-exercise-new', 'x'),
          patientSessionId: undefined,
        },
      ],
    },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSession.complete',
    name: "A's active session",
    input: { id: 'session-a-active' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSession.interrupt',
    name: "A's active session",
    input: { id: 'session-a-active' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSession.syncWorkingCopy',
    name: "A's active session",
    input: {
      id: 'session-a-active',
      exercises: [sessionExerciseRow('session-exercise-a', 'session-a-active')],
    },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSession.startImmersive',
    name: "a video session for A's patient",
    input: {
      id: 'session-new',
      patientId: 'patient-a',
      immersiveVideoId: 'video-1',
    },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSession.endImmersive',
    name: "A's video session",
    input: { sessionId: 'session-a-video', endReason: 'STOPPED' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSessionData.upsertMany',
    name: "progress on A's session",
    input: [
      {
        patientSessionId: 'session-a-active',
        sessionExerciseId: 'session-exercise-a',
        value: '10',
      },
    ],
    refusal: 'NOT_FOUND',
  },
  {
    path: 'patientSessionData.upsertMany',
    name: "A's exercise row, filed under B's own session",
    input: [
      {
        patientSessionId: 'session-b-active',
        sessionExerciseId: 'session-exercise-a',
        value: '10',
      },
    ],
    refusal: 'NOT_FOUND',
    control: {
      userId: B,
      input: [
        {
          patientSessionId: 'session-b-active',
          sessionExerciseId: 'session-exercise-b',
          value: '10',
        },
      ],
    },
  },
  {
    path: 'supplementalTherapy.createRel',
    name: "A's session",
    input: { patientSessionId: 'session-a-done', methods: ['therapy-1'] },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'reusableProgram.find',
    name: "A's program",
    input: { id: 'program-a' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'reusableProgram.update',
    name: "A's program",
    input: { id: 'program-a', name: 'Renamed' },
    refusal: 'FORBIDDEN',
  },
  {
    path: 'reusableProgram.retire',
    name: "A's program",
    input: { id: 'program-a' },
    refusal: 'FORBIDDEN',
  },
  {
    path: 'reusableProgram.copy',
    name: "A's program",
    input: { id: 'program-a' },
    refusal: 'FORBIDDEN',
  },
  {
    path: 'reusableProgramExercise.createMany',
    name: "A's program",
    input: {
      reusableProgramId: 'program-a',
      exercises: [
        {
          ...programExerciseRow('program-exercise-new', 'program-a'),
          position: 1,
        },
      ],
    },
    refusal: 'FORBIDDEN',
  },
  {
    path: 'reusableProgramExercise.updateMany',
    name: "A's program",
    input: {
      reusableProgramId: 'program-a',
      exercises: [
        { ...programExerciseRow('program-exercise-a', 'program-a'), sets: 5 },
      ],
    },
    refusal: 'FORBIDDEN',
  },
  {
    path: 'device.delete',
    name: "A's headset",
    input: { id: 'device-a' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'devicePairing.start',
    name: "A's unpaired headset",
    input: { deviceRecordId: 'device-a-unpaired' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'devicePairing.status',
    name: "A's pairing attempt",
    input: { attemptId: 'attempt-a' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'devicePairing.cancel',
    name: "A's pairing attempt",
    input: { attemptId: 'attempt-a' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'deviceVideo.reportLibraryState',
    name: "A's headset",
    input: { deviceId: 'headset-a', freeBytes: 1000, videos: [] },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'deviceVideo.requestDownload',
    name: "A's headset",
    input: { deviceId: 'headset-a', videoId: 'video-1' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'deviceVideo.applyEvent',
    name: "A's headset",
    input: { deviceId: 'headset-a', videoId: 'video-1', status: 'ready' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'deviceVideo.remove',
    name: "A's headset",
    input: { deviceId: 'headset-a', videoId: 'video-1' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'favoriteExercise.remove',
    name: "A's favorite",
    input: { id: 'favorite-a' },
    refusal: 'NOT_FOUND',
  },
  {
    path: 'user.isUserVerified',
    name: "A's email address",
    input: { email: 'a@clinic.test' },
    refusal: 'nothing',
  },
]

/**
 * Signed-in procedures that name no record another clinician owns: they read
 * shared catalogs, act on the caller's own account, or create a new record
 * whose owner the server sets. Adding a procedure means putting it here or
 * adding a case above.
 */
const NO_OWNED_RECORD_ID = [
  'account.list',
  'avatar.list',
  'bugReport.create',
  'consoleAccessCode.redeem',
  'consoleBilling.readCatalog',
  'consoleBilling.scheduleCyclePlanChange',
  'consoleBilling.startSubscribeCheckout',
  'consolePromo.cancelPending',
  'consolePromo.readDiscount',
  'consolePromo.readPending',
  'consolePromo.redeem',
  'consolePromo.redeemPreflight',
  'consolePromo.remove',
  'consolePromo.savePending',
  'device.create',
  'device.list',
  'deviceVideo.listForUser',
  'entitlementClock.getStanding',
  'entitlementClock.markTrialWelcomeSeen',
  'exercise.list',
  'exercise.listCategories',
  'exercise.listItems',
  'favoriteExercise.add',
  'favoriteExercise.list',
  'immersiveVideo.list',
  'map.list',
  'me',
  'patient.create',
  'patientSession.listRecent',
  'pendingAccountDeletion.cancel',
  'pendingAccountDeletion.getActive',
  'pendingAccountDeletion.resend',
  'pendingAccountDeletion.start',
  'pendingPasswordChange.cancel',
  'pendingPasswordChange.getActive',
  'pendingPasswordChange.resend',
  'pendingPasswordChange.startChange',
  'pendingPasswordChange.startSetup',
  'productEvent.track',
  'renewPrompt.evaluate',
  'renewPrompt.listInApp',
  'reusableProgram.create',
  'reusableProgram.list',
  'reusableProgram.listStarterTemplates',
  'supplementalTherapy.list',
  'user.findUsername',
  'user.hasPassword',
  'user.updateInfo',
]

function collectProcedures(
  node: unknown,
  path: string[] = [],
): [string, AnyProcedure][] {
  if (isProcedure(node)) return [[path.join('.'), node]]
  if (node === null || typeof node !== 'object') return []
  return Object.entries(node).flatMap(([key, child]) =>
    collectProcedures(child, [...path, key]),
  )
}

let procedures = new Map<string, AnyProcedure>()

beforeAll(async () => {
  // Modules behind the router read these at import time.
  process.env.CDN_URL ??= 'https://cdn.example.test'
  process.env.SMTP_HOST ??= 'smtp.example.test'
  process.env.SMTP_USER ??= 'test'
  process.env.SMTP_PASS ??= 'test'
  const { router } = await import('./router.ts')
  procedures = new Map(collectProcedures(router))
})

function contextFor(userId: string, prisma: unknown) {
  return {
    headers: new Headers(),
    user: { id: userId, role: 'user', email: `${userId}@clinic.test` },
    session: { id: `session-of-${userId}` },
    prisma,
    s3: { uploadFile: vi.fn(), deleteFile: vi.fn() },
  } as never
}

async function run(path: string, userId: string, input: unknown) {
  const { prisma, snapshot } = createInMemoryPrisma(seed())
  const before = snapshot()
  try {
    const output = await call(procedures.get(path)!, input, {
      context: contextFor(userId, prisma),
    })
    return { output, error: null, before, after: snapshot() }
  } catch (error) {
    return { output: undefined, error, before, after: snapshot() }
  }
}

const isEmpty = (output: unknown) =>
  output == null || (Array.isArray(output) && output.length === 0)

const describeError = (error: unknown) =>
  error instanceof ORPCError
    ? error.code
    : error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error)

describe('console procedures only touch the caller’s own records', () => {
  it('has a case, or a reason it needs none, for every signed-in procedure', () => {
    const signedIn = [...procedures]
      .filter(([, procedure]) => {
        const middlewares = procedure['~orpc'].middlewares
        return (
          middlewares.includes(requireAuth) &&
          !middlewares.includes(requireAdminRole)
        )
      })
      .map(([path]) => path)
    const covered = new Set([
      ...CASES.map((c) => c.path),
      ...NO_OWNED_RECORD_ID,
    ])

    expect(signedIn.filter((path) => !covered.has(path))).toEqual([])
    expect([...covered].filter((path) => !signedIn.includes(path))).toEqual([])
  })

  describe.each(CASES)(
    '$path, given $name',
    ({ path, input, refusal, control }) => {
      it('refuses clinician B and changes nothing', async () => {
        const { output, error, before, after } = await run(path, B, input)

        if (refusal === 'nothing') {
          expect(error).toBeNull()
          expect(isEmpty(output)).toBe(true)
        } else {
          expect(error && describeError(error)).toBe(refusal)
        }
        expect(after).toEqual(before)
      })

      it('lets the owner through', async () => {
        const owner = control ?? { userId: A, input }
        const { output, error } = await run(path, owner.userId, owner.input)

        expect(error && describeError(error)).toBeNull()
        if (refusal === 'nothing') expect(isEmpty(output)).toBe(false)
      })
    },
  )
})

describe('device.create', () => {
  it('leaves a new headset unbound, whatever identity the caller sends', async () => {
    const { prisma, snapshot } = createInMemoryPrisma(seed())
    await call(
      procedures.get('device.create')!,
      {
        ...deviceRow('device-new', B, 'headset-not-yet-paired'),
        userId: undefined,
        accessCodeId: undefined,
      },
      { context: contextFor(B, prisma) },
    )

    const created = (snapshot().device as { id: string }[]).find(
      (device) => device.id === 'device-new',
    )
    expect(created).toMatchObject({ userId: B, deviceId: null })
  })
})
