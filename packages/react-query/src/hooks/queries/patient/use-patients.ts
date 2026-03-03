import { useQuery } from '@tanstack/react-query'
import { PatientFindManyZodSchema } from '@virtality/db/definitions'
import type { z } from 'zod'
import { useORPC } from '../../../orpc-context.js'

type DefaultInput = z.infer<typeof PatientFindManyZodSchema>

export function usePatients(input?: DefaultInput) {
  const orpc = useORPC()
  return useQuery(orpc.patient.list.queryOptions({ input: { ...input } }))
}
