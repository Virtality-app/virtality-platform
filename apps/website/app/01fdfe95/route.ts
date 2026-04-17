import { NextResponse } from 'next/server'
import {
  WEBSITE_URL,
  WEBSITE_URL_LOCAL,
  WEBSITE_URL_STAGING,
} from '@virtality/shared/types'
import { serverLogger } from '@/lib/server-logger'

const env = process.env.ENV || 'development'
const logger = serverLogger.child({
  component: 'website-shortlink-route',
})

const websiteURL =
  env === 'production'
    ? WEBSITE_URL
    : env === 'preview'
      ? WEBSITE_URL_STAGING
      : WEBSITE_URL_LOCAL

export function GET() {
  logger.info('website.shortlink.redirect', {
    sourcePath: '/01fdfe95',
    targetPath: '/waitlist',
    environment: env,
  })
  return NextResponse.redirect(`${websiteURL}/waitlist`)
}
