import { cookies } from 'next/headers'
import VerifyEmail from './verify-email'

const VerifyEmailPage = async () => {
  const cookieStore = await cookies()
  const initialTimeCookie = cookieStore.get('verification_time')
  // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
  const now = Date.now()

  let remainingTime: number | undefined

  if (initialTimeCookie) {
    const lastSentAt = Number(initialTimeCookie.value)
    const elapsed = (now - lastSentAt) / 1000

    if (elapsed < 60) {
      remainingTime = Math.floor(60 - elapsed)
    } else {
      remainingTime = 0
    }
  }
  return <VerifyEmail remainingTime={remainingTime} />
}

export default VerifyEmailPage
