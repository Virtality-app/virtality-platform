import DeleteUserEmail from '@virtality/ui/components/email/delete-user-email'
import { reactToHTML, toPlainText } from '@virtality/ui/components/email/react-to-html'
import { nodemailer } from '../init.js'
import type { EmailData } from '../types/auth.js'

export const sendDeleteAccountVerification = async (data: EmailData) => {
  const {
    user: { email, name },
    url,
  } = data

  const html = await reactToHTML(DeleteUserEmail({ url, name }))
  const text = toPlainText(html)

  await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to: email,
    subject: 'Delete account - Action required',
    html,
    text,
  })
}
