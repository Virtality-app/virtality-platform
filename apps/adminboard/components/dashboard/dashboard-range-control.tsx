'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DASHBOARD_PRESETS,
  type DashboardPreset,
  type DashboardRange,
} from '@/lib/dashboard-range'
import type { DashboardGranularity } from '@/lib/dashboard-types'
import { DashboardDateRangePicker } from './dashboard-date-range-picker'
import type { DashboardRangeState } from './use-dashboard-range'

type DashboardRangeControlProps = {
  state: DashboardRangeState
  /** The span the server actually reported, used for All Time. */
  reportedRange: DashboardRange | undefined
}

export function DashboardRangeControl({
  state,
  reportedRange,
}: DashboardRangeControlProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Tabs
        value={state.preset === 'custom' ? '' : state.preset}
        onValueChange={(value) =>
          state.selectPreset(value as Exclude<DashboardPreset, 'custom'>)
        }
      >
        <TabsList aria-label='Date range'>
          {DASHBOARD_PRESETS.map((preset) => (
            <TabsTrigger key={preset.value} value={preset.value}>
              {preset.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DashboardDateRangePicker
        range={state.allTime ? (reportedRange ?? state.range) : state.range}
        label={state.allTime && !reportedRange ? 'All time' : undefined}
        isCustom={state.preset === 'custom'}
        onApply={state.selectCustomRange}
      />
      <Tabs
        value={state.granularity}
        onValueChange={(value) =>
          state.setGranularity(value as DashboardGranularity)
        }
      >
        <TabsList aria-label='Group charts by'>
          <TabsTrigger value='day'>Daily</TabsTrigger>
          <TabsTrigger value='week'>Weekly</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
