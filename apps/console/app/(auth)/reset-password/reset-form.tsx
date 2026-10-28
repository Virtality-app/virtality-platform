'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { isValidPassword } from '@/lib/utils'
import { z } from 'zod/v4'
import { Button } from '@virtality/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import Link from 'next/link'
import { FormInput } from '@/components/ui/form'
import { authClient } from '@/auth-client'
import { useRouter } from 'next/navigation'
import { notify } from '@/lib/notify'
import { useClientT } from '@/i18n/use-client-t'

const ResetSchema = z.object({
  newPassword: z.string().check(isValidPassword),
})

type ResetForm = z.infer<typeof ResetSchema>
const ResetForm = ({ token }: { token?: string }) => {
  const router = useRouter()
  const { t } = useClientT(['auth', 'common'])

  const form = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema),
    mode: 'onChange',
    defaultValues: { newPassword: '' },
  })

  const { isSubmitting } = form.formState

  if (!token) {
    throw Error(t('resetPassword.invalidToken'))
  }

  const onSubmit = async (values: ResetForm) => {
    const { newPassword } = values

    try {
      const { error } = await authClient.resetPassword({ newPassword, token })

      if (error) {
        notify.error(error.message ?? t('resetPassword.failed'))
        return
      }

      router.push('/')
    } catch (error) {
      console.error(error)
      notify.error(t('resetPassword.failed'))
    }
  }

  return (
    <Card className='w-full max-w-lg'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          {t('resetPassword.title')}
        </CardTitle>
        <CardDescription className='text-muted-foreground text-sm'>
          {t('resetPassword.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id='reset-password-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FormInput
            control={form.control}
            name='newPassword'
            label={t('field.newPassword')}
            type='password'
          />
        </form>
      </CardContent>
      <CardFooter className='flex-col gap-4'>
        <div className='flex w-full gap-2'>
          <Button asChild>
            <Link href='/' className='flex-1'>
              {t('common:btn.back')}
            </Link>
          </Button>
          <Button
            form='reset-password-form'
            type='submit'
            variant='primary'
            className='flex-1'
          >
            {isSubmitting
              ? t('resetPassword.submitting')
              : t('common:btn.submit')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ResetForm
