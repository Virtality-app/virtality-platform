export { sendThankYouEmail } from './lib/send-thank-you.js'
export { sendDeleteAccountVerification } from './lib/send-delete-account-ver.js'
export { sendResetPassword } from './lib/send-reset-password.js'
export { sendVerificationEmail } from './lib/send-email-verification.js'
export { sendEmail } from './lib/send-email.js'
export { sendChangeEmailConfirmation } from './lib/send-change-email-confirmation.js'

export type { EmailData, ChangeEmailData } from './types/auth.js'
export type { SendEmailOptions } from './lib/send-email.js'
