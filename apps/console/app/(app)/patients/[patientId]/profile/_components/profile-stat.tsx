import { cn } from '@/lib/utils'

/** A number over its label, right-aligned in the profile header. */
const ProfileStat = ({
  value,
  label,
  className,
}: {
  value: string
  label: string
  className?: string
}) => (
  <div className={cn('px-4 text-right', className)}>
    <div className='text-[19px] font-semibold text-zinc-900 tabular-nums dark:text-zinc-100'>
      {value}
    </div>
    <div className='text-[11.5px] text-zinc-500 dark:text-zinc-400'>
      {label}
    </div>
  </div>
)

export default ProfileStat
