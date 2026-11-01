import 'dotenv/config'
import { prisma } from '../src/client.ts'
import { seedDevAdmin } from './seeds/dev-admin-seed.ts'
import { seedClinicalBootstrap } from './seeds/clinical-bootstrap-seed.ts'
import { DEV_ADMIN } from './seeds/dev-admin-constants.ts'

async function main() {
  const ownerUserId = await seedDevAdmin(prisma)
  const summary = await seedClinicalBootstrap(prisma, ownerUserId)

  if (summary.insertedFallbackExercises) {
    console.log('No enabled exercises found; inserted fallback exercises.')
  }
  console.log(
    `Seeded local admin ${DEV_ADMIN.email} / ${DEV_ADMIN.password} with ${summary.patients} patients, ${summary.programs} reusable programs and ${summary.sessions} completed sessions.`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
