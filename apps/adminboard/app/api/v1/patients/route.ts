import { getUserAndSession } from '@/lib/actions/authActions'
import { getPatients } from '@/data/server/patient'
import { NextResponse } from 'next/server'
import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'adminboard-api-patients',
})

export async function GET() {
  const data = await getUserAndSession()

  if (!data) {
    logger.warn('adminboard.patients.list.unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const patients = await getPatients()

  logger.info('adminboard.patients.list.completed', {
    patientCount: patients?.length ?? 0,
  })

  return Response.json({ patients })
}
export async function POST() {}
