import {
  reactToHTML,
  toPlainText,
} from '@virtality/ui/components/email/react-to-html'
import { nodemailer } from '../init.js'
import type { ChangeEmailData } from '../types/auth.js'
import ChangeEmailConfirmation from '@virtality/ui/components/email/change-email-confirmation'

export const sendChangeEmailConfirmation = async (data: ChangeEmailData) => {
  const {
    user: { email, name },
    newEmail,
    url,
    token,
  } = data

  const html = await reactToHTML(
    ChangeEmailConfirmation({ url, name, newEmail }),
  )
  const text = toPlainText(html)

  await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to: email,
    subject: 'Change email confirmation',
    html,
    text,
  })
  return
}
