'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRow, useStore } from 'tinybase/ui-react'
import type { PatientLocalData } from '@/types/models'
import {
  emptyHomePickerSelection,
  homeLaunchHref,
  isHeadsetSelectable,
  QUICK_START_PROGRAM_ID,
  isSameHomePickerSelection,
  reconcileHomePickerSelection,
  summarizeHomePicker,
  type HomePickerSelection,
} from '@/lib/home-session-picker'
import {
  homePickerHref,
  readHomePickerSeed,
  withoutHomePickerParams,
} from '@/lib/home-picker-return'
import type { HomeDashboardData } from './use-home-dashboard-data'

/**
 * Local state of the three-step picker. The choice is handed to the patient
 * dashboard the same way it remembers its own: through the patient's local
 * row (`lastProgram` / `lastHeadset`), then a navigation.
 */
export function useStartSessionPicker(data: HomeDashboardData) {
  const router = useRouter()
  const store = useStore()
  const searchParams = useSearchParams()
  // What the dashboard was opened with, e.g. a patient just created from it.
  // Kept until the clinician picks something, since a new item can be missing
  // from the lists until they refetch.
  const [seed, setSeed] = useState(() => readHomePickerSeed(searchParams))
  const [selection, setSelection] = useState<HomePickerSelection>(() => ({
    ...emptyHomePickerSelection,
    ...seed,
  }))
  const [patientQuery, setPatientQuery] = useState('')

  const { isLoading, patients, programs, devices, presenceById, summary } = data

  // The seed lives in state now; drop it from the URL so a reload starts clean.
  useEffect(() => {
    if (Object.keys(seed).length === 0) return
    const query = withoutHomePickerParams(
      new URLSearchParams(window.location.search),
    )
    router.replace(query ? `/?${query}` : '/', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patientLocalData = useRow(
    'patients',
    selection.patientId ?? '',
  ) as Partial<PatientLocalData>

  // Default to whoever had the last session; a lone patient needs no choice.
  useEffect(() => {
    if (selection.patientId || patients.length === 0) return
    const lastPatientId = summary.lastSession?.patientId
    const fallback =
      patients.find((patient) => patient.id === lastPatientId) ?? patients[0]
    if (fallback && (lastPatientId || patients.length === 1)) {
      setSelection((prev) => ({ ...prev, patientId: fallback.id }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, summary.lastSession?.patientId])

  // When the patient changes, restore what they last used.
  useEffect(() => {
    if (!selection.patientId || isLoading) return
    const lastProgram = patientLocalData.lastProgram
    const lastHeadset = patientLocalData.lastHeadset
    const onlyDevice = devices.length === 1 ? devices[0]?.data.id : undefined

    // Presence polling hands back a fresh map every render, so only commit a
    // new selection when something actually changed.
    setSelection((prev) => {
      const next = reconcileHomePickerSelection(
        {
          ...prev,
          programId: prev.programId ?? seed.programId ?? lastProgram ?? null,
          deviceId:
            prev.deviceId ?? seed.deviceId ?? lastHeadset ?? onlyDevice ?? null,
        },
        {
          programIds: programs.map((program) => program.id),
          deviceIds: devices
            .filter(({ data }) =>
              isHeadsetSelectable(presenceById[data.id] ?? 'unpaired'),
            )
            .map(({ data }) => data.id),
        },
      )
      return isSameHomePickerSelection(prev, next) ? prev : next
    })
  }, [
    selection.patientId,
    isLoading,
    seed,
    patientLocalData.lastProgram,
    patientLocalData.lastHeadset,
    programs,
    devices,
    presenceById,
  ])

  const selectPatient = (patientId: string) => {
    setSeed({})
    setSelection({ patientId, programId: null, deviceId: null })
  }
  const selectProgram = (programId: string) => {
    setSeed({})
    setSelection((prev) => ({ ...prev, programId }))
  }
  const selectDevice = (deviceId: string) => {
    setSeed({})
    setSelection((prev) => ({ ...prev, deviceId }))
  }

  const selectedPatient = patients.find((p) => p.id === selection.patientId)
  const selectedProgram = programs.find((p) => p.id === selection.programId)
  const selectedDevice = devices.find((d) => d.data.id === selection.deviceId)

  const pickerSummary = useMemo(
    () =>
      summarizeHomePicker(selection, {
        patientId: selectedPatient?.name,
        programId:
          selection.programId === QUICK_START_PROGRAM_ID
            ? 'Quick Start'
            : selectedProgram?.name,
        deviceId: selectedDevice?.data.name,
      }),
    [selection, selectedPatient, selectedProgram, selectedDevice],
  )

  const launchHref = homeLaunchHref(selection)

  const launch = () => {
    if (!launchHref || !selection.patientId || !store) return
    if (selection.programId === QUICK_START_PROGRAM_ID) {
      store.delCell('patients', selection.patientId, 'lastProgram')
    } else if (selection.programId) {
      store.setCell(
        'patients',
        selection.patientId,
        'lastProgram',
        selection.programId,
      )
    }
    if (selection.deviceId) {
      store.setCell(
        'patients',
        selection.patientId,
        'lastHeadset',
        selection.deviceId,
      )
    }
    router.push(launchHref)
  }

  return {
    selection,
    patientQuery,
    setPatientQuery,
    selectPatient,
    selectProgram,
    selectDevice,
    lastProgramId: patientLocalData.lastProgram ?? null,
    pickerSummary,
    canLaunch: launchHref !== null,
    launch,
    /** Where a create page sends the clinician back to, with this selection. */
    returnTo: homePickerHref(selection),
  }
}

export type StartSessionPicker = ReturnType<typeof useStartSessionPicker>
