import type { ReactNode } from 'react'

/** One label/value line in a session card's Session Details. */
const SessionDetailRow = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className='flex items-start justify-between gap-4'>
    <span className='text-muted-foreground'>{label}</span>
    <span className='text-right'>{children}</span>
  </div>
)

export default SessionDetailRow
