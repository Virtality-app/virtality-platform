import type { ProgressDataPoint } from '@/types/models'
import { z } from 'zod/v4'

export type CompletedRepMeasurement = {
  completedRep: number
  progress: number
}

export type CompletedSetEvent = {
  completedSet: number
}

type ParseWirePayloadResult<T> = { ok: true; data: T } | { ok: false }

const RepEndWireSchema = z.object({
  previousRep: z.number(),
  progress: z.number(),
})

const SetEndWireSchema = z.object({
  previousSet: z.number().int().min(1),
})

function parseWirePayload<T>(
  payload: string,
  schema: z.ZodType<T>,
): ParseWirePayloadResult<T> {
  try {
    const parsed = JSON.parse(payload) as unknown
    const validated = schema.safeParse(parsed)

    if (!validated.success) {
      return { ok: false }
    }

    return { ok: true, data: validated.data }
  } catch {
    return { ok: false }
  }
}

export function normalizeRepEndPayload(
  payload: string,
): { ok: true; event: CompletedRepMeasurement } | { ok: false } {
  const parsed = parseWirePayload(payload, RepEndWireSchema)

  if (!parsed.ok) {
    return { ok: false }
  }

  return {
    ok: true,
    event: {
      completedRep: parsed.data.previousRep + 1,
      progress: parsed.data.progress,
    },
  }
}

export function normalizeSetEndPayload(
  payload: string,
): { ok: true; event: CompletedSetEvent } | { ok: false } {
  const parsed = parseWirePayload(payload, SetEndWireSchema)

  if (!parsed.ok) {
    return { ok: false }
  }

  return {
    ok: true,
    event: {
      completedSet: parsed.data.previousSet,
    },
  }
}

export function applyCompletedRepToPlotData(
  plotData: ReadonlyArray<ProgressDataPoint>,
  input: {
    completedRep: number
    activeSet: number
    progressPercent: number
  },
): ProgressDataPoint[] {
  const index = input.completedRep - 1
  const setKey = `set_${input.activeSet}`
  const updated = [...plotData]

  updated[index] = {
    ...updated[index],
    rep: input.completedRep,
    [setKey]: input.progressPercent,
  }

  return updated
}
