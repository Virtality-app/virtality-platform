import {
  getQueryClient,
  useStartPatientSessionFromAck,
  useUpsertPatientSessionData,
  useInterruptPatientSession,
  useORPC,
} from '@virtality/react-query'
import type { SessionProgressUpsertInput } from '@/lib/session-progress-persistence'

const useSessionPersistence = (patientId: string) => {
  const queryClient = getQueryClient()
  const orpc = useORPC()

  const invalidatePatientSessions = async () =>
    await queryClient.invalidateQueries({
      queryKey: orpc.patientSession.list.queryKey({
        input: { where: { patientId } },
      }),
    })

  const { mutateAsync: upsertPatientSessionData } = useUpsertPatientSessionData(
    {
      onSuccess: invalidatePatientSessions,
    },
  )

  const { mutateAsync: startPatientSessionFromAck } =
    useStartPatientSessionFromAck({
      onSuccess: invalidatePatientSessions,
    })

  const { mutateAsync: interruptPatientSession } = useInterruptPatientSession({
    onSuccess: invalidatePatientSessions,
  })

  const persistRemoteUpserts = async (
    remoteUpserts: SessionProgressUpsertInput[],
  ) => {
    if (remoteUpserts.length === 0) {
      return
    }

    await upsertPatientSessionData(remoteUpserts)
  }

  return {
    persistRemoteUpserts,
    startPatientSessionFromAck,
    interruptPatientSession,
  }
}

export type SessionPersistence = ReturnType<typeof useSessionPersistence>

export default useSessionPersistence
