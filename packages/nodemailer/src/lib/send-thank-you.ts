import WaitingListEmail from '@virtality/ui/components/email/waitinglist-email'
import { reactToHTML, toPlainText } from '@virtality/ui/components/email/react-to-html'
import { nodemailer } from '../init.js'

export const sendThankYouEmail = async (email: string) => {
  const html = await reactToHTML(WaitingListEmail({ email }))
  const text = toPlainText(html)

  await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to: email,
    subject: 'Thank you for joining waitlist.',
    html,
    text,
  })
}
