'use client'

import { Trans } from 'react-i18next'
import {
  getQueryClient,
  useDeletePatient,
  useORPC,
} from '@virtality/react-query'
import DeleteConfirmDialog from '@/components/dialogs/delete-confirm-dialog'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import { useClientT } from '@/i18n/use-client-t'

/** Confirms, then deletes a patient; shared by the Patients list and the Session Picker. */
const DeletePatientDialog = ({
  patient,
  open,
  onOpenChange,
  onDeleted,
}: {
  patient: { id: string; name: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: (patientId: string) => void
}) => {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const { t } = useClientT('patients')

  const { mutate: deletePatient } = useDeletePatient({
    onSuccess: () => {
      trackAnalyticsEvent('patient_deleted', {})
      onDeleted?.(patient.id)
      return queryClient.invalidateQueries({
        queryKey: orpc.patient.list.key(),
      })
    },
  })

  return (
    <DeleteConfirmDialog
      title={t('delete.title')}
      description={
        <Trans
          t={t}
          ns='patients'
          i18nKey='delete.description'
          values={{ name: patient.name }}
          components={{ strong: <strong className='ph-sensitive' /> }}
        />
      }
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={() => deletePatient({ id: patient.id })}
    />
  )
}

export default DeletePatientDialog
