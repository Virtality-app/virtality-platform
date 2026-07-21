import { z } from 'zod'

export const HIGHLIGHT_CARD_MAX_PER_COLLECTION = 6
export const HIGHLIGHT_CARD_TITLE_MAX_LENGTH = 80
export const HIGHLIGHT_CARD_BODY_MAX_LENGTH = 280

export const highlightCardCollectionSchema = z.enum(['benefits', 'features'])

export type HighlightCardCollection = z.infer<
  typeof highlightCardCollectionSchema
>

export const createHighlightCardInputSchema = z.object({
  collection: highlightCardCollectionSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  iconName: z.string().min(1),
})

export type CreateHighlightCardInput = z.infer<
  typeof createHighlightCardInputSchema
>

export const updateHighlightCardInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  iconName: z.string().min(1),
})

export type UpdateHighlightCardInput = z.infer<
  typeof updateHighlightCardInputSchema
>

export const reorderHighlightCardInputSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(['up', 'down']),
})

export type ReorderHighlightCardInput = z.infer<
  typeof reorderHighlightCardInputSchema
>

export const removeHighlightCardInputSchema = z.object({
  id: z.string().min(1),
})

export type RemoveHighlightCardInput = z.infer<
  typeof removeHighlightCardInputSchema
>

export type HighlightCardListItem = {
  id: string
  collection: HighlightCardCollection
  title: string
  body: string
  iconName: string
  sortOrder: number
}
