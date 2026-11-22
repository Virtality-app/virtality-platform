'use client'
import { CalendarDays, Mail, Ruler, User } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { SelectItem } from '@virtality/ui/components/select'
import { FormField, FormInput, FormSelect } from '@/components/ui/form'
import PhoneInput from '@/components/ui/phone-input'
import { PatientFormInput } from '@/lib/definitions'
import {
  patientLanguageSelectValue,
  patientSexSelectValue,
} from '@/lib/patient-form-validation'
import { useClientT } from '@/i18n/use-client-t'
import ProfileSectionCard from './profile-section-card'
import PatientDobField from './patient-dob-field'

const STACK = 'flex flex-col gap-4'

/** Basic Info tab: required details, then contact, demographics and measurements. */
const BasicInfoCards = ({
  form,
}: {
  form: UseFormReturn<PatientFormInput>
}) => {
  const { t } = useClientT(['patients', 'common', 'glossary'])

  return (
    // Every field here is personal data, so replays mask the whole tab.
    <div className='ph-sensitive grid gap-4 lg:grid-cols-3'>
      <ProfileSectionCard
        icon={<User />}
        title={t('profile.requiredDetails')}
        className='lg:col-span-3'
        contentClassName='grid gap-4 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]'
      >
        <FormInput
          control={form.control}
          name='name'
          label={<>{t('form.fullName', { ns: 'common' })} *</>}
          placeholder={t('form.namePlaceholder')}
          data-tour='patient-name'
        />
        <FormSelect
          control={form.control}
          name='sex'
          label={<>{t('form.sex', { ns: 'common' })} *</>}
          placeholder={t('form.selectSex')}
          toOptionValue={patientSexSelectValue}
          data-tour='patient-sex'
          triggerClassName='w-full shadow-none'
        >
          <SelectItem value='male'>
            {t('form.male', { ns: 'common' })}
          </SelectItem>
          <SelectItem value='female'>
            {t('form.female', { ns: 'common' })}
          </SelectItem>
        </FormSelect>
        <FormSelect
          control={form.control}
          name='language'
          label={<>{t('language', { ns: 'glossary' })} *</>}
          placeholder={t('form.selectLanguage')}
          toOptionValue={patientLanguageSelectValue}
          data-tour='patient-language'
          triggerClassName='w-full shadow-none'
        >
          <SelectItem value='Greek'>
            {t('lng.el', { ns: 'glossary' })}
          </SelectItem>
          <SelectItem value='English'>
            {t('lng.en', { ns: 'glossary' })}
          </SelectItem>
        </FormSelect>
      </ProfileSectionCard>

      <ProfileSectionCard
        icon={<Mail />}
        title={t('profile.contactDetails')}
        contentClassName={STACK}
      >
        <FormInput
          control={form.control}
          name='email'
          label={t('form.email', { ns: 'common' })}
          type='email'
          placeholder={t('form.emailPlaceholder')}
        />
        <FormField
          control={form.control}
          name='phone'
          label={t('form.phone', { ns: 'common' })}
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
      </ProfileSectionCard>

      <ProfileSectionCard
        icon={<CalendarDays />}
        title={t('profile.demographics')}
        contentClassName={STACK}
      >
        <PatientDobField form={form} />
        <FormInput
          control={form.control}
          name='occupation'
          label={t('form.occupation')}
        />
      </ProfileSectionCard>

      <ProfileSectionCard
        icon={<Ruler />}
        title={t('profile.physicalMeasurements')}
        contentClassName={STACK}
      >
        <FormInput
          control={form.control}
          name='weight'
          label={t('form.weight')}
          placeholder='70.5'
        />
        <FormInput
          control={form.control}
          name='height'
          label={t('form.height')}
          placeholder='175.0'
        />
      </ProfileSectionCard>
    </div>
  )
}

export default BasicInfoCards
