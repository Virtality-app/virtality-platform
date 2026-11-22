'use client'
import { CalendarIcon } from 'lucide-react'
import { format, formatISO } from 'date-fns'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@virtality/ui/components/button'
import { Calendar } from '@virtality/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@virtality/ui/components/popover'
import { FormField } from '@/components/ui/form'
import { PatientFormInput } from '@/lib/definitions'
import { cn } from '@/lib/utils'
import { useClientT } from '@/i18n/use-client-t'
import { useDateFnsLocale } from '@/hooks/use-date-fns-locale'

/** Date of birth, picked from a calendar and stored as an ISO date. */
const PatientDobField = ({
  form,
}: {
  form: UseFormReturn<PatientFormInput>
}) => {
  const { t } = useClientT(['patients', 'common'])
  const locale = useDateFnsLocale()

  return (
    <FormField
      control={form.control}
      name='dob'
      label={t('form.dateOfBirth', { ns: 'common' })}
    >
      {(field) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={field.id}
              aria-invalid={field['aria-invalid']}
              variant='outline'
              className={cn(
                'w-full pl-3 text-left font-normal',
                !field.value && 'text-muted-foreground',
              )}
            >
              {field.value ? (
                format(field.value, 'PPP', { locale })
              ) : (
                <span>{t('form.pickDate')}</span>
              )}
              <CalendarIcon className='ml-auto size-4 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              locale={locale}
              fixedWeeks
              captionLayout='dropdown'
              selected={field.value ? new Date(field.value) : new Date()}
              onSelect={(value) => {
                if (!value) return
                field.onChange(formatISO(value, { representation: 'date' }))
              }}
              disabled={(date) =>
                date > new Date() || date < new Date('1900-01-01')
              }
            />
          </PopoverContent>
        </Popover>
      )}
    </FormField>
  )
}

export default PatientDobField
