import EmailVerification from '@virtality/ui/components/email/email-verification'
import { reactToHTML, toPlainText } from '@virtality/ui/components/email/react-to-html'
import { nodemailer } from '../init.js'
import type { EmailData } from '../types/auth.js'

export async function sendVerificationEmail(data: EmailData) {
  const {
    user: { email },
    url,
  } = data

  const html = await reactToHTML(EmailVerification({ url }))
  const text = toPlainText(html)
  await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to: email,
    subject: 'Verify your email address',
    html,
    text,
  })
}
