import type { PrismaClient } from '../generated/client.js'
import {
  buildSessionDataValue,
  createRandom,
  daysAgoAt,
  groupExerciseFamilies,
  seedId,
} from './clinical-bootstrap-builders.ts'
import {
  FALLBACK_EXERCISES,
  SEED_PATIENTS,
  SEED_PROGRAMS,
  type SeedPatient,
  type SeedProgramKey,
} from './clinical-bootstrap-constants.ts'

type SeededProgram = {
  id: string
  name: string
  exercises: {
    exerciseId: string
    position: number
    sets: number
    reps: number
    restTime: number
    holdTime: number
    speed: number
  }[]
}

export type ClinicalBootstrapSummary = {
  insertedFallbackExercises: boolean
  programs: number
  patients: number
  sessions: number
}

export async function seedClinicalBootstrap(
  prisma: PrismaClient,
  ownerUserId: string,
): Promise<ClinicalBootstrapSummary> {
  const now = new Date()
  const insertedFallbackExercises = await ensureExercises(prisma)
  const programs = await seedReusablePrograms(prisma, ownerUserId, now)

  let sessions = 0
  for (const seedPatient of SEED_PATIENTS) {
    await seedPatientWithHistory(prisma, ownerUserId, seedPatient, now)
    sessions += await seedPatientSessions(prisma, seedPatient, programs, now)
  }

  return {
    insertedFallbackExercises,
    programs: programs.size,
    patients: SEED_PATIENTS.length,
    sessions,
  }
}

/** Inserts copies of real exercises only when no enabled exercise exists. */
async function ensureExercises(prisma: PrismaClient): Promise<boolean> {
  const enabledCount = await prisma.exercise.count({ where: { enabled: true } })
  if (enabledCount > 0) return false

  for (const exercise of FALLBACK_EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      create: exercise,
      update: exercise,
    })
  }

  return true
}

async function seedReusablePrograms(
  prisma: PrismaClient,
  ownerUserId: string,
  now: Date,
): Promise<Map<SeedProgramKey, SeededProgram>> {
  const exercises = await prisma.exercise.findMany({
    where: { enabled: true },
    orderBy: { name: 'asc' },
    select: { id: true, displayName: true },
  })
  const families = groupExerciseFamilies(exercises)
  const programs = new Map<SeedProgramKey, SeededProgram>()

  for (const program of SEED_PROGRAMS) {
    const id = seedId(`reusable-program:${program.key}`)
    const programExercises = families
      .slice(program.familyOffset, program.familyOffset + program.familyCount)
      .flat()
      .map((exercise, position) => ({
        exerciseId: exercise.id,
        position,
        ...program.settings,
      }))

    if (programExercises.length === 0) {
      console.warn(
        `Skipped program "${program.name}": not enough enabled exercises.`,
      )
      continue
    }

    await prisma.$transaction([
      prisma.reusableProgram.upsert({
        where: { id },
        create: {
          id,
          name: program.name,
          kind: 'CLINICIAN_OWNED',
          userId: ownerUserId,
          createdAt: daysAgoAt(now, 21, 9),
          updatedAt: daysAgoAt(now, 21, 9),
        },
        update: {
          name: program.name,
          kind: 'CLINICIAN_OWNED',
          userId: ownerUserId,
          retiredAt: null,
        },
      }),
      prisma.reusableProgramExercise.deleteMany({
        where: { reusableProgramId: id },
      }),
      prisma.reusableProgramExercise.createMany({
        data: programExercises.map((exercise) => ({
          id: seedId(`reusable-program:${program.key}:${exercise.position}`),
          reusableProgramId: id,
          ...exercise,
        })),
      }),
    ])

    programs.set(program.key, {
      id,
      name: program.name,
      exercises: programExercises,
    })
  }

  return programs
}

async function seedPatientWithHistory(
  prisma: PrismaClient,
  ownerUserId: string,
  seedPatient: SeedPatient,
  now: Date,
): Promise<void> {
  const id = seedId(`patient:${seedPatient.key}`)
  const firstSessionDaysAgo = Math.max(
    0,
    ...seedPatient.sessions.map((session) => session.daysAgo),
  )
  const createdAt = seedPatient.sessions.length
    ? daysAgoAt(now, firstSessionDaysAgo + 2, 9)
    : now
  const fields = {
    ...seedPatient.patient,
    userId: ownerUserId,
    image: null,
    pinnedAt: seedPatient.pinned ? createdAt : null,
    deletedAt: null,
  }

  await prisma.patient.upsert({
    where: { id },
    create: { id, ...fields, createdAt, updatedAt: createdAt },
    update: fields,
  })

  // Same shape the console's new-patient form submits.
  const medicalHistoryId = seedId(`medical-history:${seedPatient.key}`)
  const medicalHistory = {
    patientId: id,
    ...seedPatient.medicalHistory,
    deltas: JSON.stringify({
      anamnesesDeltas: null,
      complaintsDeltas: null,
      expectationsDeltas: null,
      diagnosisDeltas: null,
    }),
    bodyFront: null,
    bodyBack: null,
  }

  await prisma.medicalHistory.upsert({
    where: { id: medicalHistoryId },
    create: { id: medicalHistoryId, ...medicalHistory },
    update: medicalHistory,
  })
}

/** Completed sessions with per-rep SessionData, shaped like headset output. */
async function seedPatientSessions(
  prisma: PrismaClient,
  seedPatient: SeedPatient,
  programs: Map<SeedProgramKey, SeededProgram>,
  now: Date,
): Promise<number> {
  const patientId = seedId(`patient:${seedPatient.key}`)
  const baseScoreRandom = createRandom(`base-score:${seedPatient.key}`)
  const baseScores = new Map<string, number>()
  let seeded = 0

  for (const [index, plan] of seedPatient.sessions.entries()) {
    const program = programs.get(plan.programKey)
    if (!program) continue

    const sessionKey = `session:${seedPatient.key}:${index}`
    const sessionId = seedId(sessionKey)
    const createdAt = daysAgoAt(now, plan.daysAgo, plan.hour)
    const completedAt = new Date(
      createdAt.getTime() + plan.durationMinutes * 60_000,
    )
    const random = createRandom(sessionKey)

    const sessionExercises = program.exercises.map((exercise) => {
      if (!baseScores.has(exercise.exerciseId)) {
        baseScores.set(exercise.exerciseId, 25 + baseScoreRandom() * 20)
      }

      return {
        ...exercise,
        id: seedId(`${sessionKey}:exercise:${exercise.position}`),
        patientSessionId: sessionId,
      }
    })

    const sessionData = sessionExercises.map((exercise) => ({
      id: seedId(`${sessionKey}:data:${exercise.position}`),
      patientSessionId: sessionId,
      sessionExerciseId: exercise.id,
      value: plan.skippedPositions?.includes(exercise.position)
        ? '[]'
        : buildSessionDataValue({
            sets: exercise.sets,
            reps: exercise.reps,
            baseScore: baseScores.get(exercise.exerciseId)!,
            sessionIndex: index,
            random,
          }),
    }))

    const session = {
      patientId,
      programId: null,
      status: 'COMPLETED' as const,
      sourceReusableProgramId: program.id,
      sourceProgramName: program.name,
      nprs: null,
      notes: null,
      createdAt,
      completedAt,
      deletedAt: null,
    }

    await prisma.$transaction([
      prisma.patientSession.upsert({
        where: { id: sessionId },
        create: { id: sessionId, ...session },
        update: session,
      }),
      prisma.sessionData.deleteMany({
        where: { patientSessionId: sessionId },
      }),
      prisma.sessionExercise.deleteMany({
        where: { patientSessionId: sessionId },
      }),
      prisma.sessionExercise.createMany({ data: sessionExercises }),
      prisma.sessionData.createMany({ data: sessionData }),
    ])

    seeded++
  }

  return seeded
}
