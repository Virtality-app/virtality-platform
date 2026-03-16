import { toPlainText } from '@virtality/ui/components/email/react-to-html'
import { nodemailer } from '../init.js'

export type SendEmailOptions = {
  to: string
  subject: string
  html: string
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const text = toPlainText(html)

  await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to,
    subject,
    html,
    text,
  })
}
