import Dashboard from '@/app/(pages)/user/user-dashboard/dashboard'
import { cookies } from 'next/headers'

const HomePage = async () => {
  const cookieStore = await cookies()

  const cookie = cookieStore.get('virtality_admin_session')

  return <Dashboard isImpersonating={!!cookie} />
}

export default HomePage
