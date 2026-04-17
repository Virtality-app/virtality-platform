import { getUserAndSession } from '@/lib/actions/authActions'
import { getFiles } from '@/S3'
import { NextResponse } from 'next/server'
import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'adminboard-api-bucket',
})

export const GET = async () => {
  const data = await getUserAndSession()

  if (!data) {
    logger.warn('adminboard.bucket_list.unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const images = await getFiles()

  logger.info('adminboard.bucket_list.completed', {
    imageCount: images?.length ?? 0,
  })

  return NextResponse.json({ images })
}
