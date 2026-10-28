'use client'
import { authClient } from '@/auth-client'
import { Button } from '@virtality/ui/components/button'
import { Input } from '@virtality/ui/components/input'
import { SignInForm, SignInSchema } from '@/lib/definitions'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { warmUpSocketServer } from '@/lib/warm-up-socket-server'
import { DEFAULT_POST_LOGIN_PATH } from '@/lib/sign-in-redirect'
import { useClientT } from '@/i18n/use-client-t'

type EmailSignInProps = {
  postLoginPath?: string
  testerCode?: string
}

const EmailSignIn = ({
  postLoginPath = DEFAULT_POST_LOGIN_PATH,
  testerCode,
}: EmailSignInProps) => {
  const router = useRouter()
  const { t } = useClientT('auth')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const form = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: SignInForm) => {
    setLoading(true)
    try {
      await authClient.signIn.email({
        ...values,
        // testerCode isn't part of the signIn.email schema, but the
        // server reads it off the raw request body (readSignUpCodeFromUnknown).
        ...(testerCode ? ({ testerCode } as object) : {}),
        fetchOptions: {
          onSuccess: () => {
            void warmUpSocketServer()
            router.push(postLoginPath)
          },
          onError: (ctx) => {
            setLoading(false)
            setAuthError(ctx.error.message)
          },
        },
      })
    } catch (error) {
      console.error('Error signing in: ', error)
      setLoading(false)
      setAuthError(t('signIn.unexpectedError'))
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className='flex flex-col gap-2'>
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t('field.email')}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type='email'
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t('field.password')}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type='password'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type='submit' size='lg' disabled={loading}>
          {loading ? <Loader2 className='animate-spin' /> : t('signIn.submit')}
        </Button>
        {authError && <div className='text-red-500'>{authError}</div>}
      </div>
    </form>
  )
}

export default EmailSignIn
