import type { ReactNode } from 'react'

type DashboardQueryStateProps<T> = {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  children: (data: T) => ReactNode
}

export function DashboardQueryState<T>({
  data,
  isLoading,
  isError,
  children,
}: DashboardQueryStateProps<T>) {
  if (isError) {
    return (
      <p className='text-sm text-red-600 dark:text-red-400'>
        Couldn’t load session data. Try again in a moment.
      </p>
    )
  }

  if (isLoading || data === undefined) {
    return <p className='text-muted-foreground text-sm'>Loading sessions…</p>
  }

  return <>{children(data)}</>
}
