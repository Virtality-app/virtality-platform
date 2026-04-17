import { getUserAndSession } from '@/lib/actions/authActions'
import { getPresets, getPresetsByUser } from '@/data/server/preset'
import { NextRequest, NextResponse } from 'next/server'
import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'adminboard-api-presets',
})

export async function GET(req: NextRequest) {
  const data = await getUserAndSession()
  const searchParams = req.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!data) {
    logger.warn('adminboard.presets.list.unauthorized', {
      userId: userId ?? 'all',
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (userId) {
    const presets = await getPresetsByUser(userId)
    logger.info('adminboard.presets.list.completed', {
      scope: 'user',
      userId,
      presetCount: presets?.length ?? 0,
    })
    return NextResponse.json({ presets })
  }

  const presets = await getPresets()

  logger.info('adminboard.presets.list.completed', {
    scope: 'all',
    presetCount: presets?.length ?? 0,
  })

  return NextResponse.json({ presets })
}
export async function POST() {}
