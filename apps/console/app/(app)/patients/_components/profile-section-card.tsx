import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ProfileSectionCardProps = {
  icon: ReactNode
  title: string
  /** Sits at the right of the card header, e.g. a "Clear all" button. */
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

/** A titled card: icon chip and title over a padded body. */
const ProfileSectionCard = ({
  icon,
  title,
  action,
  className,
  contentClassName,
  children,
}: ProfileSectionCardProps) => (
  <section
    className={cn(
      'rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900',
      className,
    )}
  >
    <header className='flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800'>
      <span className='text-vital-blue-700 dark:text-vital-blue-300 grid size-7.5 shrink-0 place-items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 [&_svg]:size-4'>
        {icon}
      </span>
      <h2 className='text-[14.5px] font-semibold text-zinc-900 dark:text-zinc-100'>
        {title}
      </h2>
      {action && <div className='ml-auto'>{action}</div>}
    </header>
    <div className={cn('px-5 py-4.5', contentClassName)}>{children}</div>
  </section>
)

export default ProfileSectionCard
