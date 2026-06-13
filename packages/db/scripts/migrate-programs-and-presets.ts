import 'dotenv/config'
import { prisma } from '../index.ts'
import {
  buildProgramPresetMigrationPlan,
  formatProgramPresetMigrationLog,
} from '@virtality/shared/utils'

const dryRun = process.argv.includes('--dry-run')

async function main() {
  const [
    patientPrograms,
    presets,
    patientSessions,
    exercises,
    existingReusablePrograms,
  ] = await Promise.all([
    prisma.patientProgram.findMany({
      include: { programExercise: true },
    }),
    prisma.preset.findMany({
      include: { presetExercise: true },
    }),
    prisma.patientSession.findMany({
      select: {
        id: true,
        programId: true,
        sourceReusableProgramId: true,
        sourceProgramName: true,
      },
    }),
    prisma.exercise.findMany({
      select: { id: true },
    }),
    prisma.reusableProgram.findMany({
      select: { id: true },
    }),
  ])

  const plan = buildProgramPresetMigrationPlan({
    patientPrograms,
    presets,
    patientSessions,
    knownExerciseIds: new Set(exercises.map((exercise) => exercise.id)),
    existingReusableProgramIds: new Set(
      existingReusablePrograms.map((program) => program.id),
    ),
  })

  console.log(formatProgramPresetMigrationLog(plan.log, dryRun))
  console.log('')
  console.log(
    `Prepared ${plan.reusablePrograms.length} reusable programs, ${plan.reusableProgramExercises.length} exercises, and ${plan.sessionUpdates.length} session updates.`,
  )

  if (dryRun) {
    return
  }

  await prisma.$transaction(async (tx) => {
    for (const program of plan.reusablePrograms) {
      await tx.reusableProgram.create({ data: program })
    }

    if (plan.reusableProgramExercises.length > 0) {
      await tx.reusableProgramExercise.createMany({
        data: plan.reusableProgramExercises,
      })
    }

    for (const update of plan.sessionUpdates) {
      await tx.patientSession.update({
        where: { id: update.id },
        data: {
          sourceReusableProgramId: update.sourceReusableProgramId,
          sourceProgramName: update.sourceProgramName,
        },
      })
    }
  })

  console.log('Migration applied successfully.')
}

main()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
