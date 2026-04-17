import { getUserAndSession } from '@/lib/actions/authActions'
import { getPatient } from '@/data/server/patient'
import { NextRequest, NextResponse } from 'next/server'
import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'adminboard-api-patient-detail',
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const data = await getUserAndSession()

  if (!data) {
    logger.warn('adminboard.patient_detail.unauthorized', {
      patientId: id,
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const patient = await getPatient(id)

  logger.info('adminboard.patient_detail.completed', {
    patientId: id,
    found: Boolean(patient),
  })

  return NextResponse.json({ patient })
}
export async function POST() {}
export async function PUT() {}
// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string; userId: string }> },
// ) {
//   const { id } = await params;
//   await deleteDeviceAction(id);
//   return Response.json({ status: 'ok' });
// }
