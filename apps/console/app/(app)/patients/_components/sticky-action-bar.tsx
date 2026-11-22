import type { ReactNode } from 'react'

type StickyActionBarProps = {
  /** Status on the left, e.g. Unsaved changes or a delete prompt. */
  status?: ReactNode
  /** The buttons, aligned right. */
  children: ReactNode
}

/** The patient form footer: stays at the bottom of the screen while the form scrolls. */
const StickyActionBar = ({ status, children }: StickyActionBarProps) => (
  <div className='sticky bottom-0 z-20 border-t border-zinc-200 bg-white/90 px-6 py-3.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90'>
    <div className='mx-auto flex max-w-280 flex-wrap items-center gap-3'>
      {status}
      <div className='ml-auto flex items-center gap-2.5'>{children}</div>
    </div>
  </div>
)

export default StickyActionBar
