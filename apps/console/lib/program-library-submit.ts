import { z } from 'zod/v4'
import { ReusableProgramKind } from '@virtality/shared/utils'
import {
  enabledVariantsForSubmit,
  hasEnabledVariantsForSubmit,
} from './program-submit-enabled-variants'

export const ReusableProgramFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name cannot be empty' }),
})

export type ReusableProgramForm = z.infer<typeof ReusableProgramFormSchema>

export type ReusableProgramExerciseVariant = {
  id: string
  exerciseId: string
  sets: number
  reps: number
  restTime: number
  holdTime: number
  speed: number
}

export type ReusableProgramExerciseInput = {
  id: string
  reusableProgramId: string
  exerciseId: string
  position: number
  sets: number
  reps: number
  restTime: number
  holdTime: number
  speed: number
}

export function reusableProgramExercisesForCreateSubmit(
  variants: readonly ReusableProgramExerciseVariant[],
  deferredRemovalIds: readonly string[],
  reusableProgramId: string,
  generateId: () => string,
): ReusableProgramExerciseInput[] {
  return enabledVariantsForSubmit(variants, deferredRemovalIds).map(
    (variant, position) => ({
      id: generateId(),
      reusableProgramId,
      exerciseId: variant.exerciseId,
      position,
      sets: variant.sets,
      reps: variant.reps,
      restTime: variant.restTime,
      holdTime: variant.holdTime,
      speed: variant.speed,
    }),
  )
}

export function reusableProgramExercisesForEditSubmit(
  variants: readonly ReusableProgramExerciseVariant[],
  deferredRemovalIds: readonly string[],
  reusableProgramId: string,
): ReusableProgramExerciseInput[] {
  return enabledVariantsForSubmit(variants, deferredRemovalIds).map(
    (variant, position) => ({
      id: variant.id,
      reusableProgramId,
      exerciseId: variant.exerciseId,
      position,
      sets: variant.sets,
      reps: variant.reps,
      restTime: variant.restTime,
      holdTime: variant.holdTime,
      speed: variant.speed,
    }),
  )
}

export function canSubmitReusableProgram(
  name: string,
  variants: readonly { id: string }[],
  deferredRemovalIds: readonly string[],
): { ok: true } | { ok: false; reason: 'name' | 'exercises' } {
  if (name.trim() === '') {
    return { ok: false, reason: 'name' }
  }

  if (!hasEnabledVariantsForSubmit(variants, deferredRemovalIds)) {
    return { ok: false, reason: 'exercises' }
  }

  return { ok: true }
}

export function isStarterTemplateProgram(program: { kind: string }): boolean {
  return program.kind === ReusableProgramKind.STARTER_TEMPLATE
}
