'use client'
import { Button } from '@virtality/ui/components/button'
import { Calendar } from '@virtality/ui/components/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { FormField, FormInput, FormSelect } from '@/components/ui/form'
import PhoneInput from '@/components/ui/phone-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@virtality/ui/components/popover'
import { SelectItem } from '@virtality/ui/components/select'
import { cn } from '@/lib/utils'
import { PatientFormInput } from '@/lib/definitions'
import {
  patientLanguageSelectValue,
  patientSexSelectValue,
} from '@/lib/patient-form-validation'
import { Patient } from '@virtality/db'
import { CalendarIcon, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { format, formatISO } from 'date-fns'
import { useClientT } from '@/i18n/use-client-t'
import usePageViewTracking from '@/hooks/analytics/use-page-view-tracking'
import PatientPhotoField from './patient-photo-field'

interface BasicInfoProps {
  form: ReturnType<typeof useForm<PatientFormInput>>
  patient?: Patient
}

const BasicInfo = ({ form, patient }: BasicInfoProps) => {
  usePageViewTracking({
    props: { route_group: 'patient', tab_view: 'patient-profile' },
  })
  const { t } = useClientT(['common'])

  return (
    <div className='flex gap-6 max-xl:flex-col'>
      <PatientPhotoField form={form} patient={patient} />

      <Card className='border p-0 backdrop-blur-sm'>
        <CardHeader className='from-vital-blue-700 to-vital-blue-600 rounded-t-lg bg-linear-to-br p-2 text-zinc-200'>
          <CardTitle className='flex items-center gap-2'>
            <User className='size-4' />
            Patient Information
          </CardTitle>
          <CardDescription className='text-zinc-200'>
            Basic patient details and demographics
          </CardDescription>
        </CardHeader>
        <CardContent className='flex-1 space-y-6 p-6'>
          <div className='grid gap-4'>
            <FormInput
              control={form.control}
              name='name'
              label={<>{t('form.fullName')} *</>}
              placeholder="Enter patient's full name"
              data-tour='patient-name'
            />
            <div className='grid gap-4 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='email'
                label={t('form.email')}
                type='email'
                placeholder='patient@example.com'
              />
              <FormField
                control={form.control}
                name='phone'
                label={t('form.phone')}
              >
                {(field) => (
                  <PhoneInput
                    id={field.id}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    disabled={field.disabled}
                  />
                )}
              </FormField>
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='dob'
                label={t('form.dateOfBirth')}
              >
                {(field) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id={field.id}
                        aria-invalid={field['aria-invalid']}
                        variant='outline'
                        className={cn(
                          'pl-3 text-left font-normal',
                          (!field.value || !patient?.dob) &&
                            'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        fixedWeeks
                        captionLayout='dropdown'
                        selected={
                          field.value ? new Date(field.value) : new Date()
                        }
                        onSelect={(value) => {
                          if (!value) return
                          field.onChange(
                            formatISO(value, { representation: 'date' }),
                          )
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              <FormSelect
                control={form.control}
                name='sex'
                label={<>{t('form.sex')} *</>}
                placeholder='Select sex...'
                toOptionValue={patientSexSelectValue}
                data-tour='patient-sex'
                triggerClassName='w-full shadow-none'
                contentClassName='bg-white'
              >
                <SelectItem value='male'>{t('form.male')}</SelectItem>
                <SelectItem value='female'>{t('form.female')}</SelectItem>
              </FormSelect>
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='weight'
                label='Weight (kg)'
                placeholder='70.5'
              />
              <FormInput
                control={form.control}
                name='height'
                label='Height (cm)'
                placeholder='175.0'
              />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormSelect
                control={form.control}
                name='language'
                label={<>{t('language', { ns: 'glossary' })} *</>}
                placeholder='Select language...'
                toOptionValue={patientLanguageSelectValue}
                data-tour='patient-language'
                triggerClassName='w-full shadow-none'
                contentClassName='bg-white'
              >
                <SelectItem value='Greek'>
                  {t('lng.el', { ns: 'glossary' })}
                </SelectItem>
                <SelectItem value='English'>
                  {t('lng.en', { ns: 'glossary' })}
                </SelectItem>
              </FormSelect>
              <FormInput
                control={form.control}
                name='occupation'
                label='Occupation'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BasicInfo
