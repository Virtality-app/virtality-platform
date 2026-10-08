'use client'

import { Button } from '@/components/ui/button'
import FilterBadge from '@/components/ui/filter-badge'
import {
  countActiveExerciseFilters,
  type ExerciseTableFilters as Filters,
} from '@/lib/exercise-table-filters'
import { toggleListValue } from '@/lib/table-value-filters'
import { X } from 'lucide-react'
import { ValueFilter } from '@/components/tables/value-filter'

type ExerciseTableFiltersProps = {
  categories: string[]
  directions: string[]
  value: Filters
  onChange: (next: Filters) => void
  onReset: () => void
}

export const ExerciseTableFilters = ({
  categories,
  directions,
  value,
  onChange,
  onReset,
}: ExerciseTableFiltersProps) => {
  const activeCount = countActiveExerciseFilters(value)

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <ValueFilter
        label='Category'
        options={categories}
        selected={value.categories}
        onToggle={(category) =>
          onChange({
            ...value,
            categories: toggleListValue(value.categories, category),
          })
        }
        onClear={() => onChange({ ...value, categories: [] })}
      />
      <ValueFilter
        label='Direction'
        options={directions}
        selected={value.directions}
        onToggle={(direction) =>
          onChange({
            ...value,
            directions: toggleListValue(value.directions, direction),
          })
        }
        onClear={() => onChange({ ...value, directions: [] })}
      />
      <FilterBadge
        name='new'
        checked={value.onlyNew}
        onClick={() => onChange({ ...value, onlyNew: !value.onlyNew })}
      />
      <FilterBadge
        name='enabled'
        checked={value.onlyEnabled}
        onClick={() => onChange({ ...value, onlyEnabled: !value.onlyEnabled })}
      />
      {activeCount > 0 ? (
        <Button type='button' variant='ghost' size='sm' onClick={onReset}>
          <X className='mr-1 size-3.5' />
          Reset
        </Button>
      ) : null}
    </div>
  )
}
