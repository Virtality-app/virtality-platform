import type { ReactNode } from 'react'

/** A rounded chip for one identity fact (age and sex, email, phone). */
const ProfileMetaPill = ({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) => (
  <span className='inline-flex min-w-0 items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[12.5px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 [&_svg]:size-3.25 [&_svg]:shrink-0'>
    {icon}
    <span className='truncate'>{children}</span>
  </span>
)

export default ProfileMetaPill
