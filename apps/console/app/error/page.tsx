'use client'

import { ErrorDisplay } from '@/components/ui/error-display'
import { useSearchParams } from 'next/navigation'

const ErrorPage = ({ error }: { error?: Error }) => {
  const message = useSearchParams().get('message')

  return (
    <ErrorDisplay
      variant='page'
      title='Something went wrong'
      message={message ?? 'Unknown error'}
    />
  )
}

export default ErrorPage
