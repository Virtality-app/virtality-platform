import type { ParsePayload } from 'zod/v4/core'
import {
  getPasswordRequirementStatus,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@virtality/shared/utils'
import type { Translate } from '@/i18n/translate'

/**
 * The shared password policy, with each failed rule worded through `t` (keys in
 * `validation`) so the message follows the selected language.
 */
export const createPasswordCheck =
  (t: Translate) => (ctx: ParsePayload<string>) => {
    const status = getPasswordRequirementStatus(ctx.value)
    const failed = [
      [status.length, 'password_length', 'length'],
      [status.uppercase, 'password_uppercase', 'uppercase'],
      [status.lowercase, 'password_lowercase', 'lowercase'],
      [status.digit, 'password_digit', 'digit'],
    ] as const

    for (const [ok, key, code] of failed) {
      if (ok) continue
      ctx.issues.push({
        message: t(key, {
          ns: 'validation',
          min: PASSWORD_MIN_LENGTH,
          max: PASSWORD_MAX_LENGTH,
        }),
        input: ctx.value,
        code: code as 'custom',
      })
    }
  }
