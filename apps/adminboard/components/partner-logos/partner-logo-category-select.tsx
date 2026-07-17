'use client'

import {
  isPartnerLogoCategory,
  PARTNER_LOGO_CATEGORIES,
  PARTNER_LOGO_CATEGORY_LABELS,
} from '@/lib/partner-logos'
import type { PartnerLogoCategory } from '@virtality/shared/types'
import { Label } from '@virtality/ui/components/label'

type PartnerLogoCategorySelectProps = {
  id: string
  value: PartnerLogoCategory
  disabled?: boolean
  onChange: (category: PartnerLogoCategory) => void
}

export function PartnerLogoCategorySelect({
  id,
  value,
  disabled,
  onChange,
}: PartnerLogoCategorySelectProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>Category</Label>
      <select
        id={id}
        className='bg-background w-full rounded-md border px-3 py-2 text-sm'
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const nextValue = event.target.value
          if (isPartnerLogoCategory(nextValue)) {
            onChange(nextValue)
          }
        }}
      >
        {PARTNER_LOGO_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {PARTNER_LOGO_CATEGORY_LABELS[category]}
          </option>
        ))}
      </select>
    </div>
  )
}
