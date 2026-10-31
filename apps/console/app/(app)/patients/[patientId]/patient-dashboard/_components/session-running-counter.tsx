import { useClientT } from '@/i18n/use-client-t'

interface SessionRunningCounterProps {
  label: string
  current: number
  total: number
}

/** One large set or rep count, sized to be read from across the room. */
const SessionRunningCounter = ({
  label,
  current,
  total,
}: SessionRunningCounterProps) => {
  const { t } = useClientT('patient-dashboard')

  return (
    <div className='min-w-24'>
      <p className='text-muted-foreground text-sm'>{label}</p>
      <p className='mt-1 flex items-baseline gap-1.5 tabular-nums'>
        <span className='text-5xl leading-none font-semibold tracking-tight'>
          {current}
        </span>
        <span className='text-muted-foreground text-lg'>
          {t('running.outOf', { total })}
        </span>
      </p>
    </div>
  )
}

export default SessionRunningCounter
