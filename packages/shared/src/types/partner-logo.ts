import { z } from 'zod'

export const partnerLogoCategorySchema = z.enum(['strategic', 'clinical'])

export type PartnerLogoCategory = z.infer<typeof partnerLogoCategorySchema>

export const createPartnerLogoInputSchema = z.object({
  objectKey: z.string().min(1),
  alt: z.string().min(1),
  category: partnerLogoCategorySchema,
})

export type CreatePartnerLogoInput = z.infer<
  typeof createPartnerLogoInputSchema
>

export type PartnerLogoListItem = {
  id: string
  objectKey: string
  alt: string
  category: PartnerLogoCategory
  sortOrder: number
  cdnUrl: string
}
