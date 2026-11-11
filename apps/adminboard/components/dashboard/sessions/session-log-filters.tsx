import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sumTypeCounts } from '@/lib/dashboard-chart-model'
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type ClinicianActivity,
  type SessionSavedFilter as SavedFilter,
  type SessionTypeCounts,
} from '@/lib/dashboard-types'
import { SessionSavedFilter } from './session-saved-filter'
import type { SessionTypeFilter } from './use-session-log-filters'

type SessionLogFiltersProps = {
  search: string
  type: SessionTypeFilter
  ownerUserId: string
  saved: SavedFilter
  countsByType: SessionTypeCounts | undefined
  savedCounts: { saved: number; notSaved: number } | undefined
  clinicians: ClinicianActivity[]
  onSearchChange: (search: string) => void
  onTypeChange: (type: SessionTypeFilter) => void
  onOwnerChange: (ownerUserId: string) => void
  onSavedChange: (saved: SavedFilter) => void
}

const countLabel = (count: number | undefined) =>
  count === undefined ? '' : ` ${count}`

export function SessionLogFilters({
  search,
  type,
  ownerUserId,
  saved,
  countsByType,
  savedCounts,
  clinicians,
  onSearchChange,
  onTypeChange,
  onOwnerChange,
  onSavedChange,
}: SessionLogFiltersProps) {
  return (
    <div className='bg-card flex flex-wrap items-end gap-4 rounded-xl border p-4'>
      <div className='flex min-w-56 flex-1 flex-col gap-1.5'>
        <Label htmlFor='session-log-search'>Search</Label>
        <Input
          id='session-log-search'
          type='search'
          placeholder='Patient, clinician or program'
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className='flex flex-col gap-1.5'>
        <span className='text-sm font-medium'>Type</span>
        <Tabs
          value={type}
          onValueChange={(value) => onTypeChange(value as SessionTypeFilter)}
        >
          <TabsList aria-label='Session type'>
            <TabsTrigger value='all'>
              All
              {countLabel(countsByType && sumTypeCounts(countsByType))}
            </TabsTrigger>
            {SESSION_TYPES.map((sessionType) => (
              <TabsTrigger key={sessionType} value={sessionType}>
                {SESSION_TYPE_LABELS[sessionType]}
                {countLabel(countsByType?.[sessionType])}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <SessionSavedFilter
        value={saved}
        counts={savedCounts}
        onChange={onSavedChange}
      />
      <div className='flex w-56 flex-col gap-1.5'>
        <Label htmlFor='session-log-clinician'>Clinician</Label>
        <Select value={ownerUserId} onValueChange={onOwnerChange}>
          <SelectTrigger id='session-log-clinician'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All clinicians</SelectItem>
            {clinicians.map((clinician) => (
              <SelectItem key={clinician.userId} value={clinician.userId}>
                {clinician.userLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
