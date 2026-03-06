import { NextResponse } from 'next/server'
import {
  WEBSITE_URL,
  WEBSITE_URL_LOCAL,
  WEBSITE_URL_STAGING,
} from '@virtality/shared/types'

const env = process.env.ENV || 'development'

const websiteURL =
  env === 'production'
    ? WEBSITE_URL
    : env === 'preview'
      ? WEBSITE_URL_STAGING
      : WEBSITE_URL_LOCAL

export function GET() {
  return NextResponse.redirect(`${websiteURL}/waitlist`)
}
