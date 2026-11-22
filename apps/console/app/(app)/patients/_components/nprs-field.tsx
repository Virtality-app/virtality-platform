'use client'
import type { UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/ui/form'
import { Slider } from '@/components/ui/slider'
import { PatientFormInput } from '@/lib/definitions'
import { cn } from '@/lib/utils'

/** The 0–10 pain slider, with its value coloured by severity. */
const NprsField = ({
  form,
  label,
}: {
  form: UseFormReturn<PatientFormInput>
  label: string
}) => (
  <FormField name='nprs' label={label} control={form.control}>
    {(field) => {
      const value = Number(field.value) || 0
      return (
        <div className='flex items-center gap-3'>
          <Slider
            id={field.id}
            value={[value]}
            onValueChange={(next) => field.onChange(String(next[0]))}
            max={10}
            step={1}
            className='flex-1'
          />
          <span
            className={cn(
              'min-w-10 text-center text-sm font-semibold tabular-nums',
              value > 7
                ? 'text-red-600 dark:text-red-400'
                : value >= 5
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-teal-600 dark:text-teal-400',
            )}
          >
            {value}/10
          </span>
        </div>
      )
    }}
  </FormField>
)

export default NprsField
