import { z } from 'zod'

export const assignPromoVideoInputSchema = z.object({
  objectKey: z.string().min(1),
})

export type AssignPromoVideoInput = z.infer<typeof assignPromoVideoInputSchema>

export type PromoVideoItem = {
  id: string
  objectKey: string
  cdnUrl: string
}
