import { z } from 'zod/v4'

/** Image and video shared by every row of one Exercise family (same `displayName`). */
export const updateExerciseFamilyMediaInputSchema = z.object({
  displayName: z.string().trim().min(1),
  image: z.string().trim().min(1).nullable(),
  video: z.string().trim().min(1).nullable(),
})

export type UpdateExerciseFamilyMediaInput = z.infer<
  typeof updateExerciseFamilyMediaInputSchema
>
