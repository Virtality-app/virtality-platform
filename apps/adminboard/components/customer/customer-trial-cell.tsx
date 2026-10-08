import { cn } from '@/lib/utils'
import {
  formatCustomerTrialStanding,
  type CustomerTrialStanding,
} from '@/lib/customer-table-display'

export function CustomerTrialCell({
  standing,
}: {
  standing: CustomerTrialStanding
}) {
  return (
    <div
      className={cn(
        standing.kind === 'expired' && 'text-destructive font-medium',
        standing.kind === 'none' && 'text-muted-foreground',
      )}
    >
      {formatCustomerTrialStanding(standing)}
    </div>
  )
}
