'use client'

import { Button } from '@/components/ui/button'
import FilterBadge from '@/components/ui/filter-badge'
import { ValueFilter } from '@/components/tables/value-filter'
import {
  countActiveCustomerFilters,
  CUSTOMER_ACCESS_FILTER_OPTIONS,
  CUSTOMER_BILLING_FILTER_OPTIONS,
  CUSTOMER_TRIAL_FILTER_OPTIONS,
  toggleCustomerVrFilter,
  type CustomerTableFilters as Filters,
} from '@/lib/customer-table-filters'
import { toggleListValue } from '@/lib/table-value-filters'
import { X } from 'lucide-react'

type CustomerTableFiltersProps = {
  value: Filters
  onChange: (next: Filters) => void
  onReset: () => void
}

export function CustomerTableFilters({
  value,
  onChange,
  onReset,
}: CustomerTableFiltersProps) {
  const activeCount = countActiveCustomerFilters(value)

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <ValueFilter
        label='Trial'
        options={CUSTOMER_TRIAL_FILTER_OPTIONS}
        selected={value.trial}
        onToggle={(option) =>
          onChange({ ...value, trial: toggleListValue(value.trial, option) })
        }
        onClear={() => onChange({ ...value, trial: [] })}
      />
      <ValueFilter
        label='Access'
        options={CUSTOMER_ACCESS_FILTER_OPTIONS}
        selected={value.access}
        onToggle={(option) =>
          onChange({ ...value, access: toggleListValue(value.access, option) })
        }
        onClear={() => onChange({ ...value, access: [] })}
      />
      <ValueFilter
        label='Billing'
        options={CUSTOMER_BILLING_FILTER_OPTIONS}
        selected={value.billing}
        onToggle={(option) =>
          onChange({
            ...value,
            billing: toggleListValue(value.billing, option),
          })
        }
        onClear={() => onChange({ ...value, billing: [] })}
      />
      <FilterBadge
        name='✅ VR'
        checked={value.vr === 'with'}
        onClick={() =>
          onChange({ ...value, vr: toggleCustomerVrFilter(value.vr, 'with') })
        }
      />
      <FilterBadge
        name='❌ No VR'
        checked={value.vr === 'without'}
        onClick={() =>
          onChange({
            ...value,
            vr: toggleCustomerVrFilter(value.vr, 'without'),
          })
        }
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
