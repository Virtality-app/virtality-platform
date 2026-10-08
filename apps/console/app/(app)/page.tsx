import Dashboard from './_components/dashboard'
import WelcomeScreen from './_components/welcome-screen'
import { DeviceContextProvider } from '@/context/device-context'
import { cookies } from 'next/headers'
import { resolveHomeDashboardEnabled } from '@/lib/home-dashboard-feature'

const env = process.env.ENV ?? process.env.NEXT_PUBLIC_ENV ?? 'development'
const authCookieNameSuffix = env === 'preview' ? '_preview' : ''
const adminSessionCookieName = `virtality${authCookieNameSuffix}_admin_session`

const HomePage = async () => {
  const cookieStore = await cookies()

  const cookie = cookieStore.get(
    env === 'production' || env === 'preview'
      ? `__Secure-${adminSessionCookieName}`
      : adminSessionCookieName,
  )

  if (!resolveHomeDashboardEnabled()) {
    return <WelcomeScreen isImpersonating={!!cookie} />
  }

  return (
    <DeviceContextProvider>
      <Dashboard isImpersonating={!!cookie} />
    </DeviceContextProvider>
  )
}

export default HomePage
