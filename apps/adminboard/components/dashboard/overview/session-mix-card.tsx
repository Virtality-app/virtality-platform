import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { cn } from '@/lib/utils'
import { formatMinutes, formatShare } from '@/lib/dashboard-format'
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type SessionActivityReport,
} from '@/lib/dashboard-types'
import { SESSION_TYPE_SWATCH } from '../session-type-style'
import { TypeSplitBar } from '../type-split-bar'

type SessionMixCardProps = {
  summary: SessionActivityReport['summary']
}

export function SessionMixCard({ summary }: SessionMixCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Session mix</CardTitle>
        <CardDescription>Share of sessions by type</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <TypeSplitBar
          counts={summary.sessionsByType}
          label='Session mix'
          className='h-6 rounded-md'
        />
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-muted-foreground border-b text-left text-xs uppercase'>
              <th className='pb-2 font-medium'>Type</th>
              <th className='pb-2 text-right font-medium'>Count</th>
              <th className='pb-2 text-right font-medium'>Share</th>
              <th className='pb-2 text-right font-medium'>Avg</th>
            </tr>
          </thead>
          <tbody>
            {SESSION_TYPES.map((type) => (
              <tr key={type} className='border-b last:border-b-0'>
                <td className='py-2.5'>
                  <span className='flex items-center gap-2'>
                    <span
                      aria-hidden
                      className={cn(
                        'size-2.5 rounded-sm',
                        SESSION_TYPE_SWATCH[type],
                      )}
                    />
                    {SESSION_TYPE_LABELS[type]}
                  </span>
                </td>
                <td className='py-2.5 text-right font-semibold'>
                  {summary.sessionsByType[type]}
                </td>
                <td className='text-muted-foreground py-2.5 text-right'>
                  {formatShare(
                    summary.sessionsByType[type],
                    summary.sessionCount,
                  )}
                </td>
                <td className='text-muted-foreground py-2.5 text-right'>
                  {formatMinutes(summary.averageMinutesByType[type])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
