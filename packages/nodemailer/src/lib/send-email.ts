import * as Nodemailer from 'nodemailer'
import { toPlainText } from '@virtality/ui/components/email/react-to-html'
import { isEmailLocalTesting, nodemailer } from '../init.js'

export type SendEmailAttachment = {
  filename: string
  content: Uint8Array
  contentType: string
}

export type SendEmailOptions = {
  to: string
  subject: string
  html: string
  attachments?: SendEmailAttachment[]
}

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: SendEmailOptions) => {
  const text = toPlainText(html)

  const info = await nodemailer.sendMail({
    from: 'Virtality <hey@mail.virtality.app>',
    to,
    subject,
    html,
    text,
    attachments: attachments?.map(({ filename, content, contentType }) => ({
      filename,
      contentType,
      content: Buffer.from(
        content.buffer,
        content.byteOffset,
        content.byteLength,
      ),
    })),
  })

  if (isEmailLocalTesting) {
    console.log(
      `[email:local-testing] "${subject}" to ${to}: preview ${Nodemailer.getTestMessageUrl(info)}`,
    )
  }
}
