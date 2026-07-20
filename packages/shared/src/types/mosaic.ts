import { z } from 'zod'

export const MOSAIC_GRID_SIZE = 3

export const mosaicMediaKindSchema = z.enum(['image', 'video'])

export type MosaicMediaKind = z.infer<typeof mosaicMediaKindSchema>

export const mosaicTilePlacementSchema = z.object({
  row: z
    .number()
    .int()
    .min(0)
    .max(MOSAIC_GRID_SIZE - 1),
  col: z
    .number()
    .int()
    .min(0)
    .max(MOSAIC_GRID_SIZE - 1),
  width: z.union([z.literal(1), z.literal(2)]),
  height: z.union([z.literal(1), z.literal(2)]),
})

export type MosaicTilePlacement = z.infer<typeof mosaicTilePlacementSchema>

export const mosaicTileInputSchema = mosaicTilePlacementSchema.extend({
  objectKey: z.string().min(1),
  mediaKind: mosaicMediaKindSchema,
  alt: z.string().min(1),
})

export type MosaicTileInput = z.infer<typeof mosaicTileInputSchema>

export const MOSAIC_EMPTY_SAVE_WARNING =
  'Saving an empty mosaic hides the landing section for all visitors.'

export const saveMosaicInputSchema = z.object({
  tiles: z.array(mosaicTileInputSchema),
  acknowledgeEmptyHide: z.boolean().optional().default(false),
})

export type SaveMosaicInput = z.infer<typeof saveMosaicInputSchema>

export type MosaicLiveEligibility =
  | { status: 'empty' }
  | { status: 'live' }
  | { status: 'incomplete'; errors: string[] }

export type MosaicTileListItem = {
  id: string
  objectKey: string
  mediaKind: MosaicMediaKind
  alt: string
  row: number
  col: number
  width: number
  height: number
  cdnUrl: string
}

export type MosaicBoardView = {
  tiles: MosaicTileListItem[]
  eligibility: MosaicLiveEligibility
}

export type SaveMosaicResult = MosaicBoardView & {
  warnings?: string[]
}
