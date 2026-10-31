import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  PatientSessionSchema,
  PatientSessionForm,
} from '@virtality/shared/types'
import {
  SessionCompletionSaveChoice,
  generateUUID,
} from '@virtality/shared/utils'
import {
  getQueryClient,
  useCompleteSession,
  useCreateSupplementalTherapyRelMutation,
  useDeletePatientSession,
  useORPC,
  usePatientSession,
  useReusableProgram,
} from '@virtality/react-query'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import {
  buildInitialSessionCompletionDialogState,
  buildSessionCompletionPayload,
  canShowUpdateSourceProgramOption,
  type SessionCompletionDialogState,
} from '@/lib/session-completion-dialog'
import { buildSessionCompletionSummary } from '@/lib/session-completion-summary'

export type SessionCompletionValues = PatientSessionForm & {
  notes?: string | null
}

/** Data, form and save/discard actions behind the Session Completed dialog. */
export function useSessionCompletion() {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const { state, handler, patientId } = usePatientDashboard()
  const { isDialogOpen, completionSessionId, exercises } = state
  const { updatePatientDashboardState } = handler
  const { data: session } = usePatientSession({
    sessionId: completionSessionId ?? undefined,
  })
  const { data: sourceProgram } = useReusableProgram({
    id: session?.sourceReusableProgramId ?? undefined,
  })

  const [completionState, setCompletionState] =
    useState<SessionCompletionDialogState>(
      buildInitialSessionCompletionDialogState(null),
    )

  useEffect(() => {
    if (!isDialogOpen) return
    setCompletionState(
      buildInitialSessionCompletionDialogState(session?.sourceProgramName),
    )
  }, [isDialogOpen, session?.sourceProgramName])

  const showUpdateSourceProgram = canShowUpdateSourceProgramOption(
    {
      sourceReusableProgramId: session?.sourceReusableProgramId ?? null,
      sourceProgramName: session?.sourceProgramName ?? null,
    },
    sourceProgram,
  )

  const summary = useMemo(
    () => (isDialogOpen ? buildSessionCompletionSummary(session) : null),
    [isDialogOpen, session],
  )

  const { mutateAsync: completeSession, isPending: isCompleting } =
    useCompleteSession({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.patientSession.list.queryKey({
            input: { where: { patientId } },
          }),
        })
        queryClient.invalidateQueries({
          queryKey: orpc.reusableProgram.list.key(),
        })
      },
    })

  const { mutateAsync: createSupplementalTherapyRel } =
    useCreateSupplementalTherapyRelMutation({
      onSuccess: (_, variables) => {
        trackAnalyticsEvent('supplemental_therapy_selected', {
          session_id: completionSessionId ?? '',
          therapy_count: variables.methods?.length ?? 0,
          includes_other: !!variables.otherEnabled,
        })
      },
    })

  const { mutate: deletePatientSession } = useDeletePatientSession({
    onSuccess: () => {
      trackAnalyticsEvent('session_deleted_without_save', {
        session_id: completionSessionId ?? '',
      })
    },
  })

  const form = useForm({
    resolver: zodResolver(
      PatientSessionSchema.extend({ notes: z.string().optional().nullable() }),
    ),
    defaultValues: {
      methods: [],
      otherEnabled: false,
      otherText: '',
      notes: '',
    },
    values: {
      notes: session?.notes ?? '',
    },
  })

  const closeDialog = () => {
    updatePatientDashboardState({
      isDialogOpen: false,
      completionSessionId: null,
    })
    form.reset()
  }

  const onSubmit = async (values: SessionCompletionValues) => {
    if (!completionSessionId) return

    if (
      completionState.saveChoice ===
        SessionCompletionSaveChoice.UPDATE_SOURCE_PROGRAM &&
      !completionState.showUpdateConfirmation
    ) {
      setCompletionState((current) => ({
        ...current,
        showUpdateConfirmation: true,
      }))
      return
    }

    const payload = buildSessionCompletionPayload({
      sessionId: completionSessionId,
      saveChoice: completionState.saveChoice,
      newProgramName: completionState.newProgramName,
      notes: values.notes,
      workingCopy: exercises,
      persistedRows:
        session?.sessionExercise?.map((exercise) => ({
          id: exercise.id,
          exerciseId: exercise.exerciseId,
        })) ?? [],
      createId: generateUUID,
    })

    await completeSession(payload)
    await createSupplementalTherapyRel({
      ...values,
      patientSessionId: completionSessionId,
    })

    trackAnalyticsEvent('session_notes_saved', {
      session_id: completionSessionId,
      notes_length: values.notes?.length ?? 0,
    })

    closeDialog()
  }

  const finish = form.handleSubmit(onSubmit)

  const discard = () => {
    if (!completionSessionId) return
    closeDialog()
    deletePatientSession({ id: completionSessionId })
  }

  return {
    isDialogOpen,
    session,
    summary,
    form,
    completionState,
    setCompletionState,
    showUpdateSourceProgram,
    isCompleting,
    finish,
    discard,
  }
}

export type SessionCompletionForm = ReturnType<
  typeof useSessionCompletion
>['form']
