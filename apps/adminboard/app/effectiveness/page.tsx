'use client'

import { EffectivenessComparisonChart } from '@/components/dashboard/effectiveness-comparison-chart'
import { EffectivenessProgressQualityChart } from '@/components/dashboard/effectiveness-progress-quality-chart'
import { EffectivenessTherapyIntensityChart } from '@/components/dashboard/effectiveness-therapy-intensity-chart'
import {
  EffectivenessMetricCard,
  formatAverage,
  formatCount,
  formatDurationMinutes,
  formatPercent,
  formatProgressDelta,
  formatProgressQuality,
  formatTherapyDose,
} from '@/components/dashboard/effectiveness-metric-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
const ALL_OWNERS_VALUE = 'all'
const UNKNOWN_OWNER_VALUE = '__unknown_owner__'

const ownerSelectValue = (userId: string | null): string =>
  userId === null ? UNKNOWN_OWNER_VALUE : userId

const ownerFilterFromSelectValue = (
  value: string,
): string | null | undefined => {
  if (value === ALL_OWNERS_VALUE) {
    return undefined
  }

  if (value === UNKNOWN_OWNER_VALUE) {
    return null
  }

  return value
}

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
  const [selectedOwner, setSelectedOwner] = useState(ALL_OWNERS_VALUE)

  const rangeFrom = appliedRange.from ?? defaultFrom
  const rangeTo = appliedRange.to ?? defaultTo
  const ownerUserId = ownerFilterFromSelectValue(selectedOwner)

  const { data, isLoading, isError } = useEffectivenessReport({
    from: rangeFrom,
    to: rangeTo,
    ownerUserId,
  })

  const comparisonRows = useMemo(() => {
    if (!data?.byUser || selectedOwner !== ALL_OWNERS_VALUE) {
      return []
    }

    return data.byUser.filter(
      (row) => row.activePatients > 0 || row.completedSessions > 0,
    )
  }, [data?.byUser, selectedOwner])

  const selectedOwnerLabel = useMemo(() => {
    if (selectedOwner === ALL_OWNERS_VALUE) {
      return 'All owners'
    }

    return (
      data?.ownerOptions.find(
        (option) => ownerSelectValue(option.userId) === selectedOwner,
      )?.userLabel ?? 'Selected owner'
    )
  }, [data?.ownerOptions, selectedOwner])

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
  const progressQuality = data.progressQuality
  const therapyIntensity = data.therapyIntensity

  const progressSummary = (() => {
    if (progressQuality.sessionsWithProgressData === 0) {
      return 'No completed sessions in range included usable progress payloads.'
    }

    const deltaText =
      progressQuality.progressQualityDeltaPercent === null
        ? 'Not enough sessions with progress data to compare first vs latest quality.'
        : `First-to-latest session quality changed by ${formatProgressDelta(progressQuality.progressQualityDeltaPercent)} within the selected period.`

    const missingText =
      progressQuality.sessionsMissingProgressData > 0
        ? ` ${formatCount(progressQuality.sessionsMissingProgressData)} completed session${progressQuality.sessionsMissingProgressData === 1 ? '' : 's'} lacked usable progress data and were excluded from quality metrics.`
        : ''

    return `Average rep progress quality was ${formatProgressQuality(progressQuality.averageProgressQualityPercent)} across ${formatCount(progressQuality.sessionsWithProgressData)} session${progressQuality.sessionsWithProgressData === 1 ? '' : 's'} with progress payloads. ${deltaText}${missingText}`
  })()

  const therapySummary = (() => {
    if (therapyIntensity.sessionsWithDoseData === 0) {
      return 'No completed sessions in range included exercise settings for therapy dose.'
    }

    const missingDoseText =
      therapyIntensity.sessionsMissingDoseData > 0
        ? ` ${formatCount(therapyIntensity.sessionsMissingDoseData)} completed session${therapyIntensity.sessionsMissingDoseData === 1 ? '' : 's'} lacked exercise settings and were excluded from dose metrics.`
        : ''

    const durationText =
      therapyIntensity.averageSessionDurationMinutes === null
        ? 'Average session duration was unavailable for completed sessions in range.'
        : `Average completed session duration was ${formatDurationMinutes(therapyIntensity.averageSessionDurationMinutes)}.`

    return `Total therapy dose was ${formatTherapyDose(therapyIntensity.totalTherapyDose)} with an average of ${formatTherapyDose(therapyIntensity.averageTherapyDosePerSession)} per session with exercise settings. ${durationText}${missingDoseText}`
  })()

  return (
    <div className='min-h-screen-with-header mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
            Product Effectiveness
          </h1>
          <p className='text-muted-foreground mt-2 max-w-3xl text-sm'>
            Adoption and product progress snapshot based on completed sessions
            for non-deleted patients, grouped by patient owner. Progress quality
            reflects rep completion in session payloads. Therapy dose uses
            completed session exercise settings as a volume proxy, not a
            validated clinical dosage measure.
          </p>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor='owner-filter'
              className='text-muted-foreground text-xs font-medium'
            >
              Patient owner
            </label>
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger
                id='owner-filter'
                className='min-w-[220px] justify-between'
              >
                <SelectValue placeholder='All owners' />
              </SelectTrigger>
              <SelectContent align='end'>
                <SelectItem value={ALL_OWNERS_VALUE}>All owners</SelectItem>
                {(data?.ownerOptions ?? []).map((option) => (
                  <SelectItem
                    key={ownerSelectValue(option.userId)}
                    value={ownerSelectValue(option.userId)}
                  >
                    {option.userLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </div>

      <p className='text-muted-foreground text-sm'>
        {selectedOwner !== ALL_OWNERS_VALUE
          ? `Showing metrics for ${selectedOwnerLabel}.`
          : null}
        {selectedOwner !== ALL_OWNERS_VALUE ? ' ' : null}
        {data.hasSessionActivity
          ? `Between ${format(rangeFrom, 'dd MMM yyyy')} and ${format(rangeTo, 'dd MMM yyyy')}, ${formatCount(summary.activePatients)} of ${formatCount(summary.totalPatients)} scoped patients had at least one completed session.`
          : `No completed sessions were recorded between ${format(rangeFrom, 'dd MMM yyyy')} and ${format(rangeTo, 'dd MMM yyyy')}.`}
      </p>

      <p className='text-muted-foreground text-sm'>{progressSummary}</p>

      <p className='text-muted-foreground text-sm'>{therapySummary}</p>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
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
        <EffectivenessMetricCard
          title='Progress Quality'
          value={formatProgressQuality(
            progressQuality.averageProgressQualityPercent,
          )}
          description='Average rep progress (%) from session payloads with usable data'
          tone='slate'
        />
        <EffectivenessMetricCard
          title='Quality Delta'
          value={formatProgressDelta(
            progressQuality.progressQualityDeltaPercent,
          )}
          description='Change from earliest to latest session with progress in range'
          tone='slate'
        />
        <EffectivenessMetricCard
          title='Total Therapy Dose'
          value={formatTherapyDose(therapyIntensity.totalTherapyDose)}
          description='Sum of sets × reps × hold time × speed from session exercises'
          tone='amber'
        />
        <EffectivenessMetricCard
          title='Avg Therapy Dose'
          value={formatTherapyDose(
            therapyIntensity.averageTherapyDosePerSession,
          )}
          description='Average dose per session with exercise settings in range'
          tone='teal'
        />
        <EffectivenessMetricCard
          title='Avg Session Duration'
          value={formatDurationMinutes(
            therapyIntensity.averageSessionDurationMinutes,
          )}
          description='Average minutes from session start to completion'
          tone='violet'
        />
      </div>

      <EffectivenessProgressQualityChart data={progressQuality.trend} />

      <EffectivenessTherapyIntensityChart data={therapyIntensity.trend} />

      {selectedOwner === ALL_OWNERS_VALUE ? (
        <EffectivenessComparisonChart data={comparisonRows} />
      ) : null}

      <p className='text-muted-foreground text-xs'>
        <Link href='/' className='underline underline-offset-2'>
          Back to dashboard
        </Link>
      </p>
    </div>
  )
}

export default EffectivenessReportPage
