'use client'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { authClient } from '@/auth-client'
import { CheckCircle } from 'lucide-react'
import { getConsoleUrl } from '@virtality/shared/types'
import { useClientT } from '@/i18n/use-client-t'
import { translateMessage } from '@/i18n/translate-message'

const baseURL = getConsoleUrl()

const ResetSchema = z.object({
  email: z.email({ error: translateMessage('invalid_email') }),
})

type ForgotForm = z.infer<typeof ResetSchema>

const ForgotForm = () => {
  const { t } = useClientT(['auth', 'common'])
  const form = useForm<ForgotForm>({
    resolver: zodResolver(ResetSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotForm) => {
    const { email } = values
    await authClient.requestPasswordReset({
      email,
      redirectTo: baseURL + '/reset-password',
    })
  }

  const { isSubmitSuccessful, isSubmitting } = form.formState
  return (
    <Card className='w-full max-w-lg'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          {t('forgotPassword.title')}
        </CardTitle>
        <CardDescription className='text-muted-foreground text-sm'>
          {t('forgotPassword.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitSuccessful ? (
          <div>
            <CheckCircle />
            <p>{t('forgotPassword.sent')}</p>
          </div>
        ) : (
          <form
            id='reset-password-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormInput
              control={form.control}
              name='email'
              label={t('common:form.email')}
              type='email'
            />
          </form>
        )}
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
            disabled={isSubmitSuccessful}
          >
            {isSubmitting
              ? t('forgotPassword.sending')
              : t('forgotPassword.send')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ForgotForm
