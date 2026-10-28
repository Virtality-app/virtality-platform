'use client'
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { useClientT } from '@/i18n/use-client-t'

const SignInCardHeader = () => {
  const { t } = useClientT('auth')

  return (
    <CardHeader>
      <CardTitle className='text-2xl font-bold'>{t('signIn.title')}</CardTitle>
      <CardDescription className='text-muted-foreground text-sm'>
        {t('signIn.description')}
      </CardDescription>
    </CardHeader>
  )
}

export default SignInCardHeader
