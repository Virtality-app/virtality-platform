import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import HomeSectionLabel from './home-section-label'

/**
 * Column frame for one step of the picker: label, done marker, an optional
 * toolbar (search), the options in a scrolling list, and the footer.
 */
const StartSessionStep = ({
  number,
  label,
  done,
  toolbar,
  children,
  footer,
  tourTarget,
}: {
  number: number
  label: string
  done: boolean
  toolbar?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  /** `data-tour` hook for the Getting started walkthrough. */
  tourTarget?: string
}) => (
  <div
    role='listbox'
    aria-label={label}
    data-tour={tourTarget}
    className={cn(
      'bg-card flex min-h-62 flex-col gap-3 rounded-xl border p-4 transition-shadow',
      done &&
        'border-vital-blue-700 ring-vital-blue-100 dark:border-vital-blue-500 dark:ring-vital-blue-500/30 ring-3',
    )}
  >
    <div className='flex items-center justify-between'>
      <HomeSectionLabel>{label}</HomeSectionLabel>
      <span
        className={cn(
          'grid size-5.5 place-items-center rounded-full border text-xs font-semibold',
          done &&
            'border-vital-blue-700 bg-vital-blue-700 dark:border-vital-blue-500 dark:bg-vital-blue-500 text-white dark:text-zinc-950',
        )}
        aria-hidden
      >
        {done ? <Check className='size-3.5' strokeWidth={2.5} /> : number}
      </span>
    </div>
    {toolbar}
    <div
      data-scroll-list
      className='-mx-1 flex max-h-52 flex-col gap-1 overflow-y-auto px-1 py-0.5'
    >
      {children}
    </div>
    {footer ? (
      <div className='mt-auto flex flex-col gap-2 pt-1'>{footer}</div>
    ) : null}
  </div>
)

export default StartSessionStep
