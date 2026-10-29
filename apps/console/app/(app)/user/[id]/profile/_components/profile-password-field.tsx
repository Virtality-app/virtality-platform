'use client'
import { Input } from '@virtality/ui/components/input'
import { Button } from '@virtality/ui/components/button'
import { notify } from '@/lib/notify'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardContent, CardFooter } from '@virtality/ui/components/card'
import { FieldGroup } from '@/components/ui/field'
import { useORPC, useStartPasswordChange } from '@virtality/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useClientT } from '@/i18n/use-client-t'
import { ControllerField } from './controller-field'
import {
  PasswordFormSchema,
  getPasswordFormField,
  type PasswordForm,
} from './profile-info-form'

export const PasswordField = () => {
  const { t } = useClientT(['user', 'common'])
  const passwordFormField = getPasswordFormField(t)
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const changePasswordForm = useForm<PasswordForm>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  })

  const { mutate: startPasswordChange, isPending } = useStartPasswordChange({
    onSuccess: async () => {
      changePasswordForm.reset(
        { currentPassword: '', newPassword: '' },
        { keepDirty: false },
      )
      await queryClient.invalidateQueries({
        queryKey: orpc.pendingPasswordChange.getActive.key(),
      })
      notify.success({ key: 'profile.toast.passwordChangeStarted', ns: 'user' })
    },
    onError: (error) => {
      console.error(error)
      notify.error({ key: 'profile.toast.passwordChangeFailed', ns: 'user' })
    },
  })

  const onSubmitChangePassword = (data: PasswordForm) => {
    startPasswordChange({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }

  return (
    <form onSubmit={changePasswordForm.handleSubmit(onSubmitChangePassword)}>
      <CardContent>
        <FieldGroup className='mb-6'>
          <ControllerField
            name='currentPassword'
            control={changePasswordForm.control}
            meta={passwordFormField['currentPassword']}
            labelClassName='text-base'
          >
            {({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                type='password'
                name={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={passwordFormField['currentPassword'].placeholder}
                value={(field.value ?? '') as string}
              />
            )}
          </ControllerField>
          <ControllerField
            labelClassName='text-base'
            name='newPassword'
            control={changePasswordForm.control}
            meta={passwordFormField['newPassword']}
          >
            {({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                type='password'
                name={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={passwordFormField['newPassword'].placeholder}
                value={(field.value ?? '') as string}
              />
            )}
          </ControllerField>
        </FieldGroup>
      </CardContent>
      <CardFooter className='border-t'>
        <Button
          type='submit'
          className='ml-auto'
          disabled={!changePasswordForm.formState.isDirty || isPending}
        >
          {isPending ? t('profile.sending') : t('profile.change')}
        </Button>
      </CardFooter>
    </form>
  )
}
