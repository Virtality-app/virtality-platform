import {
  WAITLIST_INTERNAL_NOTIFICATION_SUBJECT,
  WaitlistInternalNotificationEmail,
} from '@virtality/ui/components/email/waitlist-internal-notification'
import {
  reactToHTML,
  toPlainText,
} from '@virtality/ui/components/email/react-to-html'
import { nodemailer } from '../init.js'

export type SendWaitlistNotificationInput = {
  recipient: string
  email: string
}

export async function sendWaitlistNotification({
  recipient,
  email,
}: SendWaitlistNotificationInput) {
  const html = await reactToHTML(WaitlistInternalNotificationEmail({ email }))
  const text = toPlainText(html)

  await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to: recipient,
    subject: WAITLIST_INTERNAL_NOTIFICATION_SUBJECT,
    html,
    text,
  })
}
