import ResetPassword from '@virtality/ui/components/email/reset-password'
import { reactToHTML, toPlainText } from '@virtality/ui/components/email/react-to-html'
import { nodemailer } from '../init.js'
import type { EmailData } from '../types/auth.js'

export async function sendResetPassword(data: EmailData) {
  const {
    user: { email, name },
    url,
  } = data
  const html = await reactToHTML(ResetPassword({ url, name }))
  const text = toPlainText(html)
  await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to: email,
    subject: 'Reset your password - Action required',
    html,
    text,
  })
}
