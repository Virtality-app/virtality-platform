'use client'
import { useRouter } from 'next/navigation'
import type { PatientProfileTab } from '@virtality/analytics'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { NavigationGuardDialog } from '@/components/dialogs/navigation-guard-dialog'
import useBeforeUnload from '@/hooks/use-before-unload'
import useNavigationGuard from '@/hooks/use-navigation-guard'
import useMounted from '@/hooks/use-mounted'
import { cancelHref } from '@/lib/home-picker-return'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import { useClientT } from '@/i18n/use-client-t'
import { PatientProfileSkeleton } from './patient-profile-skeleton'
import PatientProfileBreadcrumb from '@/app/(app)/patients/_components/patient-profile-breadcrumb'
import PatientProfileHeader from './patient-profile-header'
import PatientProfileTabsList from '@/app/(app)/patients/_components/patient-profile-tabs-list'
import BasicInfoCards from '@/app/(app)/patients/_components/basic-info-cards'
import ClinicalNotesCard from '@/app/(app)/patients/_components/clinical-notes-card'
import BodyAreasCard from '@/app/(app)/patients/_components/body-areas-card'
import SessionTab from './session-tab'
import ProfileActionBar from './profile-action-bar'
import { usePatientProfileForm } from './use-patient-profile-form'
import { useDeletePatientProfile } from './use-delete-patient-profile'

const FORM_ID = 'patient-form'

const PatientFormEdit = ({ patientId }: { patientId: string }) => {
  const { t } = useClientT('patients')
  const mounted = useMounted()
  const router = useRouter()
  const profile = usePatientProfileForm(patientId)
  const deletion = useDeletePatientProfile(profile.patient ?? undefined)

  useBeforeUnload(profile.isDirty)
  const { guard } = useNavigationGuard(profile.isDirty)

  if (!mounted || !profile.patient) return <PatientProfileSkeleton />
  const { patient, form } = profile

  // Opened from the dashboard's Session Picker, which Cancel returns to.
  const returnsToDashboard = cancelHref('') !== ''

  return (
    <div className='min-h-screen-with-nav flex flex-col bg-zinc-100 dark:bg-zinc-950'>
      <div className='mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 pt-7 pb-10 sm:px-8'>
        <PatientProfileBreadcrumb
          patientsLabel={t('profile.patients')}
          name={patient.name}
        />
        <PatientProfileHeader form={form} patient={patient} />

        <Tabs
          defaultValue='basic-info'
          className='gap-5'
          onValueChange={(tab) =>
            trackAnalyticsEvent('patient_tab_viewed', {
              tab: tab as PatientProfileTab,
            })
          }
        >
          <PatientProfileTabsList
            labels={{
              basicInfo: t('tabs.basicInfo'),
              medicalHistory: t('tabs.medicalHistory'),
              sessions: t('tabs.sessions'),
            }}
            basicInfoHasErrors={profile.hasErrors}
          />
          <form id={FORM_ID} onSubmit={profile.onSubmit}>
            <TabsContent value='basic-info'>
              <BasicInfoCards form={form} />
            </TabsContent>
            {/* The pain slider and body map show medical data through position
                and colour, which text masking misses, so replays hide the tab. */}
            <TabsContent value='medical-history' className='ph-no-capture'>
              <div className='flex flex-col gap-4'>
                <ClinicalNotesCard form={form} deltas={profile.deltas} />
                <BodyAreasCard
                  bodyAreas={profile.bodyAreas}
                  onChange={profile.setBodyAreas}
                  onClear={profile.clearBodyAreas}
                />
              </div>
            </TabsContent>
          </form>
          <TabsContent value='sessions'>
            <SessionTab patientId={patientId} />
          </TabsContent>
        </Tabs>
      </div>

      <ProfileActionBar
        formId={FORM_ID}
        patientName={patient.name}
        isDirty={profile.isDirty}
        isSaving={profile.isSaving}
        isDeleting={deletion.isDeleting}
        isConfirmingDelete={deletion.isConfirming}
        onAskDelete={deletion.askToDelete}
        onCancelDelete={deletion.cancelDelete}
        onConfirmDelete={deletion.confirmDelete}
        onCancel={
          returnsToDashboard
            ? () => router.push(cancelHref('/patients'))
            : undefined
        }
      />

      <NavigationGuardDialog
        {...guard}
        title={t('unsaved.title')}
        description={t('unsaved.description')}
      />
    </div>
  )
}

export default PatientFormEdit
