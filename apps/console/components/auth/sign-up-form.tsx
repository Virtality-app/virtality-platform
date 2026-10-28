import { Input } from '@virtality/ui/components/input'
import { FormField, FormInput } from '@/components/ui/form'
import { FieldDescription } from '@/components/ui/field'
import { SignUpForm } from '@/lib/definitions'
import { UseFormReturn, useWatch } from 'react-hook-form'
import { User } from '@/auth-client'
import { getPasswordRequirementStatus } from '@virtality/shared/utils'

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
      {satisfied ? '✓' : '✗'}
    </span>{' '}
    {label}
  </FieldDescription>
)

const SignupForm = ({ id, form, onSubmit }: SignupFormProps) => {
  const password = useWatch({ control: form.control, name: 'password' }) ?? ''
  const passwordRequirementStatus = getPasswordRequirementStatus(password)

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
      <FormInput control={form.control} name='name' label='Name *' />
      <FormInput control={form.control} name='email' label='Email *' />
      <FormField
        control={form.control}
        name='password'
        label='Password *'
        hideError
      >
        {(field) => (
          <div className='grid gap-2'>
            <Input type='password' {...field} value={field.value ?? ''} />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.length}
              label='Password must be between 8 and 16 characters long.'
            />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.uppercase}
              label='Password must contain at least one uppercase letter.'
            />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.lowercase}
              label='Password must contain at least one lowercase letter.'
            />
            <PasswordRequirement
              satisfied={passwordRequirementStatus.digit}
              label='Password must contain at least one digit.'
            />
          </div>
        )}
      </FormField>
    </form>
  )
}

export default SignupForm
