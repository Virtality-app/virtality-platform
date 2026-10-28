import { Suspense } from 'react'
import { Card, CardContent } from '@virtality/ui/components/card'

import SignInCardHeader from '@/components/auth/sign-in-card-header'
import SignInCardBody from '@/components/auth/sign-in-card-body'

const SignIn = () => {
  return (
    <section className='h-screen-with-header flex flex-col items-center justify-center'>
      <Card className='w-full max-w-lg'>
        <SignInCardHeader />
        <CardContent>
          <Suspense>
            <SignInCardBody />
          </Suspense>
        </CardContent>
      </Card>
    </section>
  )
}

export default SignIn
