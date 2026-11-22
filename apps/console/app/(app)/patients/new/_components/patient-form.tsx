'use client'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { NavigationGuardDialog } from '@/components/dialogs/navigation-guard-dialog'
import useBeforeUnload from '@/hooks/use-before-unload'
import useNavigationGuard from '@/hooks/use-navigation-guard'
import useMounted from '@/hooks/use-mounted'
import useIsAuthed from '@/hooks/use-is-authed'
import { useClientT } from '@/i18n/use-client-t'
import PatientProfileBreadcrumb from '@/app/(app)/patients/_components/patient-profile-breadcrumb'
import PatientProfileTabsList from '@/app/(app)/patients/_components/patient-profile-tabs-list'
import BasicInfoCards from '@/app/(app)/patients/_components/basic-info-cards'
import ClinicalNotesCard from '@/app/(app)/patients/_components/clinical-notes-card'
import BodyAreasCard from '@/app/(app)/patients/_components/body-areas-card'
import NewPatientHeader from './new-patient-header'
import NewPatientActionBar from './new-patient-action-bar'
import { NO_DELTAS, useNewPatientForm } from './use-new-patient-form'

const FORM_ID = 'patient-form'

/** New patient, laid out like the patient profile it creates. */
const PatientForm = () => {
  useIsAuthed()
  const { t } = useClientT('patients')
  const mounted = useMounted()
  const patient = useNewPatientForm()

  useBeforeUnload(patient.isDirty)
  const { guard } = useNavigationGuard(patient.isDirty)

  if (!mounted) return null
  const { form } = patient

  return (
    <div className='min-h-screen-with-nav flex flex-col bg-zinc-100 dark:bg-zinc-950'>
      <div className='mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 pt-7 pb-10 sm:px-8'>
        <PatientProfileBreadcrumb
          patientsLabel={t('profile.patients')}
          name={t('list.newPatient')}
        />
        <NewPatientHeader form={form} />

        <Tabs defaultValue='basic-info' className='gap-5'>
          <PatientProfileTabsList
            labels={{
              basicInfo: t('tabs.basicInfo'),
              medicalHistory: t('tabs.medicalHistory'),
            }}
            basicInfoHasErrors={patient.hasErrors}
          />
          <form id={FORM_ID} onSubmit={patient.onSubmit}>
            <TabsContent value='basic-info'>
              <BasicInfoCards form={form} />
            </TabsContent>
            {/* The pain slider and body map show medical data through position
                and colour, which text masking misses, so replays hide the tab. */}
            <TabsContent value='medical-history' className='ph-no-capture'>
              <div className='flex flex-col gap-4'>
                <ClinicalNotesCard form={form} deltas={NO_DELTAS} />
                <BodyAreasCard
                  bodyAreas={patient.bodyAreas}
                  onChange={patient.setBodyAreas}
                  onClear={patient.clearBodyAreas}
                />
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </div>

      <NewPatientActionBar
        formId={FORM_ID}
        isDirty={patient.isDirty}
        isCreating={patient.isCreating}
      />

      <NavigationGuardDialog
        {...guard}
        title={t('unsaved.title')}
        description={t('unsaved.description')}
      />
    </div>
  )
}

export default PatientForm
