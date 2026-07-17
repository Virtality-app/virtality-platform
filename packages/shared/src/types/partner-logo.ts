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

export const updatePartnerLogoInputSchema = createPartnerLogoInputSchema.extend(
  {
    id: z.string().min(1),
  },
)

export type UpdatePartnerLogoInput = z.infer<
  typeof updatePartnerLogoInputSchema
>

export const reorderPartnerLogoInputSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(['up', 'down']),
})

export type ReorderPartnerLogoInput = z.infer<
  typeof reorderPartnerLogoInputSchema
>

export const removePartnerLogoInputSchema = z.object({
  id: z.string().min(1),
  alsoDeleteBucketObject: z.boolean().optional().default(false),
})

export type RemovePartnerLogoInput = z.infer<
  typeof removePartnerLogoInputSchema
>

export type PartnerLogoListItem = {
  id: string
  objectKey: string
  alt: string
  category: PartnerLogoCategory
  sortOrder: number
  cdnUrl: string
}
