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
  const rawBody = await request.text()
  const secret = process.env.CAL_WEBHOOK_SECRET?.trim()

  // Cal allows webhooks without a signing secret. When configured, verify HMAC;
  // when absent, accept the payload (unsigned).
  if (secret) {
    const signature = request.headers.get('x-cal-signature-256')
    if (!verifyCalWebhookSignature(rawBody, signature, secret)) {
      logger.warn('website.cal_webhook.invalid_signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
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
    // Known trigger but no email: ack to avoid Cal retry storms.
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
