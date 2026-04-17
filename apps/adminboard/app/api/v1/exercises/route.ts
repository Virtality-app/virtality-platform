import { getUserAndSession } from '@/lib/actions/authActions'
import { getExercises } from '@/data/server/exercise'
import { NextResponse } from 'next/server'
import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'adminboard-api-exercises',
})

export async function GET() {
  const data = await getUserAndSession()

  if (!data) {
    logger.warn('adminboard.exercises.list.unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const exercises = await getExercises()

  logger.info('adminboard.exercises.list.completed', {
    exerciseCount: exercises?.length ?? 0,
  })

  return NextResponse.json({ exercises })
}
export async function POST() {}
