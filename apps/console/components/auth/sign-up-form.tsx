import { Input } from '@virtality/ui/components/input'
import { FormField, FormInput } from '@/components/ui/form'
import { FieldDescription } from '@/components/ui/field'
import { SignUpForm } from '@/lib/definitions'
import { UseFormReturn, useWatch } from 'react-hook-form'
import { User } from '@/auth-client'
import {
  getPasswordRequirementStatus,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@virtality/shared/utils'
import { useClientT } from '@/i18n/use-client-t'

interface SignupFormProps {
  id?: string
  form: UseFormReturn<SignUpForm>
  onSubmit: (values: SignUpForm | (SignUpForm & { role: User['role'] })) => void
}

const PasswordRequirement = ({
  satisfied,
  label,
}: {
  satisfied: boolean
  label: string
}) => (
  <FieldDescription>
    <span
      className={
        satisfied
          ? 'text-green-500 dark:text-green-500'
          : 'text-red-500 dark:text-red-500'
      }
    >
      {satisfied ? CHECK_MARK : CROSS_MARK}
    </span>{' '}
    {label}
  </FieldDescription>
)

const CHECK_MARK = '✓'
const CROSS_MARK = '✗'

const SignupForm = ({ id, form, onSubmit }: SignupFormProps) => {
  const { t } = useClientT('auth')
  const password = useWatch({ control: form.control, name: 'password' }) ?? ''
  const passwordRequirementStatus = getPasswordRequirementStatus(password)

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
      <FormInput control={form.control} name='name' label={t('field.name')} />
      <FormInput control={form.control} name='email' label={t('field.email')} />
      <FormField
        control={form.control}
        name='password'
        label={t('field.password')}
        hideError
      >
        {(field) => (
          <div className='grid gap-2'>
            <Input type='password' {...field} value={field.value ?? ''} />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.length}
              label={t('signUp.passwordLength', {
                min: PASSWORD_MIN_LENGTH,
                max: PASSWORD_MAX_LENGTH,
              })}
            />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.uppercase}
              label={t('signUp.passwordUppercase')}
            />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.lowercase}
              label={t('signUp.passwordLowercase')}
            />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.digit}
              label={t('signUp.passwordDigit')}
            />
          </div>
        )}
      </FormField>
    </form>
  )
}

export default SignupForm
