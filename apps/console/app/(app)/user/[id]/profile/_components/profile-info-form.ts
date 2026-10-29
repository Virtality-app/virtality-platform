import { authClient } from '@/auth-client'
import { FieldMeta, getConsoleUrl } from '@virtality/shared/types'
import { UserSchema } from '@virtality/db/definitions'
import { useORPC } from '@virtality/react-query'
import z from 'zod/v4'
import i18next from '@/i18n/i18next'
import type { Translate } from '@/i18n/translate'
import { translateMessage } from '@/i18n/translate-message'
import { createPasswordCheck } from '@/lib/translated-password-check'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@virtality/shared/utils'
import { type QueryClient } from '@tanstack/react-query'

export const baseURL = getConsoleUrl()

export type UserForm = Pick<
  z.infer<typeof UserSchema>,
  'name' | 'phoneNumber'
> & {
  image?: File | string | null
}

export const BasicInfoFormSchema = UserSchema.extend({
  image: z.instanceof(File).or(z.string()).optional().nullable(),
  phoneNumber: z.string().nullable(),
}).pick({ name: true, phoneNumber: true, image: true })

export type EmailForm = Pick<z.infer<typeof UserSchema>, 'email'>

export const EmailFormSchema = UserSchema.pick({ email: true })

// Resolved when the form is validated, so messages follow the selected language.
const isValidPassword = createPasswordCheck((key, options) =>
  i18next.t(key, options),
)

export const PasswordFormSchema = z.object({
  currentPassword: z
    .string()
    .nonempty({ error: translateMessage('current_password_required') })
    .trim(),
  newPassword: z.string().trim().check(isValidPassword),
})

export const SetPasswordFormSchema = z.object({
  newPassword: z.string().trim().check(isValidPassword),
})

export type PasswordForm = z.infer<typeof PasswordFormSchema>
export type SetPasswordForm = z.infer<typeof SetPasswordFormSchema>

export const getBasicInfoFormFields = (t: Translate) =>
  ({
    image: {
      label: t('profile.fields.image.label'),
      description: t('profile.fields.image.description'),
      hint: t('profile.fields.image.hint'),
    },
    name: {
      label: t('profile.fields.name.label'),
      placeholder: t('profile.fields.name.placeholder'),
      description: t('profile.fields.name.description'),
      hint: t('profile.fields.name.hint'),
    },
    phoneNumber: {
      label: t('common:form.phone'),
      placeholder: '+1234567890',
      description: t('profile.fields.phoneNumber.description'),
      hint: t('profile.fields.phoneNumber.hint'),
    },
  }) satisfies FieldMeta<UserForm>

export const getEmailFormField = (t: Translate) =>
  ({
    email: {
      label: t('common:form.email'),
      placeholder: 'example@domain.com',
      description: t('profile.fields.email.description'),
      hint: t('profile.fields.email.hint'),
    },
  }) satisfies FieldMeta<EmailForm>

export const getPasswordFormField = (t: Translate) =>
  ({
    currentPassword: {
      label: t('profile.fields.currentPassword.label'),
      placeholder: '********',
      description: t('profile.fields.currentPassword.description'),
      hint: t('profile.fields.currentPassword.hint'),
    },
    newPassword: {
      label: t('profile.fields.newPassword.label'),
      placeholder: '********',
      description: t('profile.fields.newPassword.description'),
      hint: t('profile.fields.newPassword.hint'),
    },
  }) satisfies FieldMeta<PasswordForm>

export type SessionUser = NonNullable<
  ReturnType<typeof authClient.useSession>['data']
>['user']

export const toFormValues = (user: SessionUser | undefined): UserForm => ({
  name: user?.name ?? '',
  phoneNumber: user?.phoneNumber ?? '',
  image: user?.image ?? null,
})

export const getSetPasswordFormField = (t: Translate) =>
  ({
    newPassword: {
      label: t('profile.fields.newPassword.label'),
      placeholder: '********',
      description: t('profile.fields.setPassword.description'),
      hint: t('profile.fields.setPassword.hint', {
        min: PASSWORD_MIN_LENGTH,
        max: PASSWORD_MAX_LENGTH,
      }),
    },
  }) satisfies FieldMeta<SetPasswordForm>

export const invalidateActivePendingPasswordChange = async (
  queryClient: QueryClient,
  orpc: ReturnType<typeof useORPC>,
) => {
  await queryClient.invalidateQueries({
    queryKey: orpc.pendingPasswordChange.getActive.key(),
  })
}

export const invalidateActivePendingAccountDeletion = async (
  queryClient: QueryClient,
  orpc: ReturnType<typeof useORPC>,
) => {
  await queryClient.invalidateQueries({
    queryKey: orpc.pendingAccountDeletion.getActive.key(),
  })
}
