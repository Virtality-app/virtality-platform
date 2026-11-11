'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  MIN_WINDOW_DAYS,
  formatRangeLabel,
  isRangeLongEnough,
  parseISODate,
  toISODate,
  type DashboardRange,
} from '@/lib/dashboard-range'

type DashboardDateRangePickerProps = {
  range: DashboardRange
  isCustom: boolean
  onApply: (range: DashboardRange) => void
  /** Shown instead of the dates, such as while All Time is loading. */
  label?: string
}

const toPickerRange = (range: DashboardRange): DateRange => ({
  from: parseISODate(range.from),
  to: parseISODate(range.to),
})

export function DashboardDateRangePicker({
  range,
  isCustom,
  onApply,
  label,
}: DashboardDateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<DateRange | undefined>(() =>
    toPickerRange(range),
  )
  const canApply =
    picked?.from && picked.to && isRangeLongEnough(picked.from, picked.to)

  const apply = () => {
    if (!picked?.from || !picked.to) return
    onApply({ from: toISODate(picked.from), to: toISODate(picked.to) })
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setPicked(toPickerRange(range))
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn('justify-start', isCustom && 'border-foreground/40')}
        >
          <CalendarIcon className='size-4' />
          {label ?? formatRangeLabel(range)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end'>
        <Calendar
          mode='range'
          defaultMonth={picked?.from}
          selected={picked}
          onSelect={setPicked}
          showOutsideDays={false}
          numberOfMonths={2}
          disabled={(date) => date > new Date()}
          classNames={{
            range_start:
              'bg-neutral-800 rounded-l-md text-white dark:bg-neutral-100 dark:text-black',
            range_middle: 'bg-neutral-200 rounded-none dark:text-black',
            range_end:
              'bg-neutral-800 rounded-r-md text-white dark:bg-neutral-100 dark:text-black',
          }}
        />
        <div className='flex items-center justify-between gap-3 border-t p-3'>
          <p className='text-muted-foreground text-xs'>
            At least {MIN_WINDOW_DAYS} days.
          </p>
          <Button size='sm' onClick={apply} disabled={!canApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
