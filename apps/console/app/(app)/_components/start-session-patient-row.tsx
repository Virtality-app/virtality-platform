'use client'

import { useState } from 'react'
import { formatRelative } from 'date-fns'
import { useClientT } from '@/i18n/use-client-t'
import type { PatientListItem } from '@/types/models'
import { withReturnTo } from '@/lib/home-picker-return'
import DeletePatientDialog from '@/components/dialogs/delete-patient-dialog'
import StartSessionOption from './start-session-option'
import StartSessionRowMenu from './start-session-row-menu'
import PatientInitialsAvatar from './patient-initials-avatar'
import type { StartSessionPicker } from './use-start-session-picker'

/** A patient in the picker, with its Edit / Delete menu. */
const StartSessionPatientRow = ({
  patient,
  picker,
}: {
  patient: PatientListItem
  picker: StartSessionPicker
}) => {
  const { t } = useClientT('home')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const selected = picker.selection.patientId === patient.id

  return (
    <div className='group/row relative'>
      <StartSessionOption
        selected={selected}
        onSelect={() => picker.selectPatient(patient.id)}
        className='pr-9'
      >
        <PatientInitialsAvatar
          name={patient.name}
          image={patient.image}
          className='size-7 text-[11px]'
        />
        <div className='min-w-0 flex-1'>
          <div className='ph-sensitive truncate'>{patient.name}</div>
          <small className='text-muted-foreground block truncate text-xs'>
            {patient.lastSessionAt
              ? formatRelative(new Date(patient.lastSessionAt), new Date())
              : t('noSessionsYet')}
            {patient.activeProgramName ? ` · ${patient.activeProgramName}` : ''}
          </small>
        </div>
      </StartSessionOption>
      <StartSessionRowMenu
        label={patient.name}
        editHref={withReturnTo(
          `/patients/${patient.id}/profile`,
          picker.returnTo,
        )}
        selected={selected}
        onDelete={() => setDeleteOpen(true)}
      />
      <DeletePatientDialog
        patient={patient}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={picker.patientDeleted}
      />
    </div>
  )
}

export default StartSessionPatientRow
