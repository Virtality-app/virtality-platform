import { NextResponse } from 'next/server'
import {
  parseCalBookingEvent,
  verifyCalWebhookSignature,
  type CalWebhookPayload,
} from '@/lib/cal-webhook'
import { captureServerSideEvent } from '@/lib/posthog-server'
import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'website-cal-webhook',
})

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) {
    logger.error('website.cal_webhook.secret_missing')
    return NextResponse.json(
      { error: 'Webhook secret is not configured' },
      { status: 500 },
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-cal-signature-256')

  if (!verifyCalWebhookSignature(rawBody, signature, secret)) {
    logger.warn('website.cal_webhook.invalid_signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: CalWebhookPayload
  try {
    body = JSON.parse(rawBody) as CalWebhookPayload
  } catch {
    logger.warn('website.cal_webhook.invalid_json')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const trigger = body.triggerEvent
  if (
    trigger &&
    trigger !== 'BOOKING_CREATED' &&
    trigger !== 'BOOKING_REQUESTED'
  ) {
    logger.info('website.cal_webhook.ignored_trigger', { trigger })
    return NextResponse.json({ ok: true, ignored: true })
  }

  const parsed = parseCalBookingEvent(body)
  if (!parsed) {
    // Valid signature + known trigger but no email: ack to avoid Cal retry storms.
    logger.warn('website.cal_webhook.incomplete_payload', {
      trigger: body.triggerEvent,
    })
    return NextResponse.json({ ok: true, skipped: 'missing_email' })
  }

  await captureServerSideEvent({
    distinctId: parsed.distinctId,
    event: parsed.eventName,
    properties: parsed.properties,
  })

  logger.info('website.cal_webhook.captured', {
    event: parsed.eventName,
    trigger: parsed.properties.cal_trigger,
  })

  return NextResponse.json({ ok: true })
}
