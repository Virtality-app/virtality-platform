import type { MarketingMosaicTile, PrismaClient } from '@virtality/db'
import {
  getMosaicBoard,
  type MosaicStore,
  type MosaicTileRecord,
} from '@virtality/shared/utils'
import { base } from '../context.ts'

export const LANDING_MOSAIC_ID = 'landing'

function toMosaicTileRecord(tile: MarketingMosaicTile): MosaicTileRecord {
  return {
    id: tile.id,
    objectKey: tile.objectKey,
    mediaKind: tile.mediaKind,
    alt: tile.alt,
    row: tile.row,
    col: tile.col,
    width: tile.width as MosaicTileRecord['width'],
    height: tile.height as MosaicTileRecord['height'],
  }
}

export function createPrismaMosaicStore(prisma: PrismaClient): MosaicStore {
  return {
    listTiles: async () => {
      const mosaic = await prisma.marketingLandingMosaic.findUnique({
        where: { id: LANDING_MOSAIC_ID },
        include: { tiles: true },
      })

      return (mosaic?.tiles ?? []).map(toMosaicTileRecord)
    },
    replaceAllTiles: async (tiles) => {
      await prisma.$transaction(async (tx) => {
        await tx.marketingMosaicTile.deleteMany({
          where: { mosaicId: LANDING_MOSAIC_ID },
        })

        await tx.marketingLandingMosaic.upsert({
          where: { id: LANDING_MOSAIC_ID },
          create: { id: LANDING_MOSAIC_ID },
          update: {},
        })

        if (tiles.length > 0) {
          await tx.marketingMosaicTile.createMany({
            data: tiles.map((tile) => ({
              id: tile.id,
              mosaicId: LANDING_MOSAIC_ID,
              objectKey: tile.objectKey,
              mediaKind: tile.mediaKind,
              alt: tile.alt,
              row: tile.row,
              col: tile.col,
              width: tile.width,
              height: tile.height,
            })),
          })
        }
      })

      return createPrismaMosaicStore(prisma).listTiles()
    },
  }
}

const getMosaicProcedure = base
  .route({ path: '/mosaic/get', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context
    return getMosaicBoard(createPrismaMosaicStore(prisma))
  })

export const mosaic = {
  get: getMosaicProcedure,
}
