import { getPresetWithExercises } from '@/data/server/preset'
import { getUserAndSession } from '@/lib/actions/authActions'
import { NextRequest, NextResponse } from 'next/server'
import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'adminboard-api-preset-detail',
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const data = await getUserAndSession()
  const { id } = await params

  if (!data) {
    logger.warn('adminboard.preset_detail.unauthorized', {
      presetId: id,
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (id) {
    const preset = await getPresetWithExercises(id)
    logger.info('adminboard.preset_detail.completed', {
      presetId: id,
      found: Boolean(preset),
    })
    return NextResponse.json({ preset })
  }

  logger.warn('adminboard.preset_detail.not_found')
  return NextResponse.json({ error: 'Not found.' }, { status: 404 })
}
export async function POST() {}
export async function PUT() {}
export async function DELETE() {}
