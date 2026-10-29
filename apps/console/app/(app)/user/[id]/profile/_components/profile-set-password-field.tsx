'use client'
import { Input } from '@virtality/ui/components/input'
import { Button } from '@virtality/ui/components/button'
import { notify } from '@/lib/notify'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardContent, CardFooter } from '@virtality/ui/components/card'
import { FieldGroup } from '@/components/ui/field'
import { useORPC, useStartPasswordSetup } from '@virtality/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useClientT } from '@/i18n/use-client-t'
import { ControllerField } from './controller-field'
import {
  SetPasswordFormSchema,
  invalidateActivePendingPasswordChange,
  getSetPasswordFormField,
  type SetPasswordForm,
} from './profile-info-form'

export const SetPasswordField = () => {
  const { t } = useClientT(['user', 'common'])
  const setPasswordFormField = getSetPasswordFormField(t)
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const setPasswordForm = useForm<SetPasswordForm>({
    resolver: zodResolver(SetPasswordFormSchema),
    defaultValues: { newPassword: '' },
  })

  const { mutate: startPasswordSetup, isPending } = useStartPasswordSetup({
    onSuccess: async () => {
      setPasswordForm.reset({ newPassword: '' }, { keepDirty: false })
      await invalidateActivePendingPasswordChange(queryClient, orpc)
      notify.success({ key: 'profile.toast.passwordSetupStarted', ns: 'user' })
    },
    onError: (error) => {
      console.error(error)
      notify.error({ key: 'profile.toast.passwordSetupFailed', ns: 'user' })
    },
  })

  const onSubmitSetPassword = (data: SetPasswordForm) => {
    startPasswordSetup({ newPassword: data.newPassword })
  }

  return (
    <form onSubmit={setPasswordForm.handleSubmit(onSubmitSetPassword)}>
      <CardContent>
        <p className='text-muted-foreground mb-4 text-sm'>
          {t('profile.noPassword')}
        </p>
        <FieldGroup className='mb-6'>
          <ControllerField
            labelClassName='text-base'
            name='newPassword'
            control={setPasswordForm.control}
            meta={setPasswordFormField['newPassword']}
          >
            {({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                type='password'
                name={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={setPasswordFormField['newPassword'].placeholder}
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
          disabled={!setPasswordForm.formState.isDirty || isPending}
        >
          {isPending ? t('profile.sending') : t('profile.setPassword')}
        </Button>
      </CardFooter>
    </form>
  )
}
