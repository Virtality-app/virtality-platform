'use client'

import { EffectivenessComparisonChart } from '@/components/dashboard/effectiveness-comparison-chart'
import {
  EffectivenessMetricCard,
  formatAverage,
  formatCount,
  formatPercent,
} from '@/components/dashboard/effectiveness-metric-card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useEffectivenessReport } from '@virtality/react-query'
import { addDays, format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { type DateRange } from 'react-day-picker'

const MIN_WINDOW_DAYS = 3

const getDefaultRange = (): { from: Date; to: Date } => {
  const to = new Date()
  to.setHours(0, 0, 0, 0)
  const from = addDays(to, -29)
  return { from, to }
}

const formatDateRangeLabel = (from: Date, to: Date): string =>
  `${format(from, 'dd/MM')} - ${format(to, 'dd/MM')}`

const EffectivenessReportPage = () => {
  const { from: defaultFrom, to: defaultTo } = getDefaultRange()

  const [appliedRange, setAppliedRange] = useState<DateRange>({
    from: defaultFrom,
    to: defaultTo,
  })
  const [pickerRange, setPickerRange] = useState<DateRange | undefined>({
    from: defaultFrom,
    to: defaultTo,
  })
  const [popoverOpen, setPopoverOpen] = useState(false)

  const rangeFrom = appliedRange.from ?? defaultFrom
  const rangeTo = appliedRange.to ?? defaultTo

  const { data, isLoading, isError } = useEffectivenessReport({
    from: rangeFrom,
    to: rangeTo,
  })

  const comparisonRows = useMemo(() => {
    if (!data?.byUser) {
      return []
    }

    return data.byUser.filter(
      (row) => row.activePatients > 0 || row.completedSessions > 0,
    )
  }, [data?.byUser])

  const applyPickerRange = () => {
    if (!pickerRange?.from || !pickerRange.to) {
      return
    }

    const from = new Date(pickerRange.from)
    const to = new Date(pickerRange.to)
    from.setHours(0, 0, 0, 0)
    to.setHours(0, 0, 0, 0)

    setAppliedRange({ from, to })
    setPickerRange({ from, to })
    setPopoverOpen(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError || !data) {
    return (
      <div className='min-h-screen-with-header mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8'>
        <p className='text-sm text-red-600 dark:text-red-400'>
          Failed to load effectiveness report.
        </p>
      </div>
    )
  }

  const summary = data.summary

  return (
    <div className='min-h-screen-with-header mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
            Product Effectiveness
          </h1>
          <p className='text-muted-foreground mt-2 max-w-3xl text-sm'>
            Adoption snapshot based on completed sessions for non-deleted
            patients, grouped by patient owner. Metrics reflect product usage,
            not clinical outcomes.
          </p>
        </div>

        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open)
            if (open) {
              setPickerRange(appliedRange)
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button variant='outline' className='min-w-[180px] justify-start'>
              <CalendarIcon className='size-4' />
              {formatDateRangeLabel(rangeFrom, rangeTo)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[450px] p-0' align='end'>
            <Calendar
              mode='range'
              defaultMonth={rangeFrom}
              selected={pickerRange}
              onSelect={setPickerRange}
              min={MIN_WINDOW_DAYS - 1}
              showOutsideDays={false}
              numberOfMonths={2}
              className='w-full'
              disabled={(date) =>
                date > new Date() || date < new Date('1900-01-01')
              }
            />
            <div className='flex justify-end border-t p-3'>
              <Button
                size='sm'
                onClick={applyPickerRange}
                disabled={!pickerRange?.from || !pickerRange.to}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <p className='text-muted-foreground text-sm'>
        {data.hasSessionActivity
          ? `Between ${format(rangeFrom, 'dd MMM yyyy')} and ${format(rangeTo, 'dd MMM yyyy')}, ${formatCount(summary.activePatients)} of ${formatCount(summary.totalPatients)} scoped patients had at least one completed session.`
          : `No completed sessions were recorded between ${format(rangeFrom, 'dd MMM yyyy')} and ${format(rangeTo, 'dd MMM yyyy')}.`}
      </p>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <EffectivenessMetricCard
          title='Active Patients'
          value={formatCount(summary.activePatients)}
          description='Patients with at least one completed session in range'
          tone='blue'
        />
        <EffectivenessMetricCard
          title='Patient Activation Rate'
          value={formatPercent(summary.patientActivationRatePercent)}
          description='Active patients divided by scoped patients'
          tone='violet'
        />
        <EffectivenessMetricCard
          title='Completed Sessions'
          value={formatCount(summary.completedSessions)}
          description='Completed sessions with a completion timestamp in range'
          tone='teal'
        />
        <EffectivenessMetricCard
          title='Avg Sessions per Active Patient'
          value={formatAverage(summary.averageSessionsPerActivePatient)}
          description='Completed sessions divided by active patients'
          tone='amber'
        />
      </div>

      <EffectivenessComparisonChart data={comparisonRows} />

      <p className='text-muted-foreground text-xs'>
        <Link href='/' className='underline underline-offset-2'>
          Back to dashboard
        </Link>
      </p>
    </div>
  )
}

export default EffectivenessReportPage
