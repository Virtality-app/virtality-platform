import { useWatch } from 'react-hook-form'
import { useSupplementalTherapyQuery } from '@virtality/react-query'
import type { PatientSessionForm } from '@virtality/shared/types'
import { FormCheckbox, FormInput } from '@/components/ui/form'
import { useClientT } from '@/i18n/use-client-t'
import {
  supplementalTherapyFallbackLabel,
  supplementalTherapyTranslationKey,
} from '@/lib/supplemental-therapy-label'
import type { SessionCompletionForm } from './use-session-completion'

interface SessionSupplementalTherapiesProps {
  form: SessionCompletionForm
}

/** Supplemental therapies used outside VR during the session. */
const SessionSupplementalTherapies = ({
  form,
}: SessionSupplementalTherapiesProps) => {
  const { t } = useClientT(['patient-dashboard', 'common'])
  const { data: supplementalTherapies } = useSupplementalTherapyQuery()
  // useWatch, not form.watch: the React Compiler caches form.watch's result
  // in a component that only receives `form`, so ticks never showed.
  const selectedMethods =
    useWatch({ control: form.control, name: 'methods' }) ?? []
  const otherEnabled = useWatch({ control: form.control, name: 'otherEnabled' })

  return (
    <fieldset className='space-y-2'>
      <legend className='mb-2 text-sm font-medium'>
        {t('sessionDialog.supplementalTherapies')}
      </legend>
      <div className='grid gap-x-4 gap-y-2 sm:grid-cols-2'>
        {supplementalTherapies?.map((method) => (
          <FormCheckbox
            key={method.id}
            control={form.control}
            label={t(supplementalTherapyTranslationKey(method.name), {
              defaultValue: supplementalTherapyFallbackLabel(method.name),
            })}
            checked={selectedMethods.includes(method.id)}
            onCheckedChange={(value) => {
              const current = form.getValues('methods') ?? []
              form.setValue(
                'methods',
                value
                  ? [...current, method.id]
                  : current.filter((id) => id !== method.id),
              )
            }}
            name={method.name as keyof PatientSessionForm}
          />
        ))}
        <FormCheckbox
          label={t('sessionDialog.other')}
          name='otherEnabled'
          control={form.control}
        />
      </div>

      {otherEnabled && (
        <FormInput
          control={form.control}
          label={
            <span className='sr-only'>
              {t('sessionDialog.otherPlaceholder')}
            </span>
          }
          name='otherText'
          placeholder={t('sessionDialog.otherPlaceholder')}
        />
      )}
    </fieldset>
  )
}

export default SessionSupplementalTherapies
