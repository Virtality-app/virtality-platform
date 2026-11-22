import type { BodyAreas } from '@/types/models'
import type {
  BodyPartsBackKey,
  BodyPartsFrontKey,
  HumanState,
} from '@/data/static/human-body'

export type BodyView = 'front' | 'back'

export type MarkedBodyArea = {
  view: BodyView
  part: BodyPartsFrontKey | BodyPartsBackKey
}

function activeParts(state: HumanState | null | undefined) {
  if (!state || typeof state !== 'object') return []
  return Object.entries(state)
    .filter(([, entry]) => entry?.isActive === true)
    .map(([part]) => part as BodyPartsFrontKey | BodyPartsBackKey)
}

/** Every marked part, front first, in body-map order. */
export function markedBodyAreas(bodyAreas: BodyAreas): MarkedBodyArea[] {
  return [
    ...activeParts(bodyAreas.front).map((part) => ({
      view: 'front' as const,
      part,
    })),
    ...activeParts(bodyAreas.back).map((part) => ({
      view: 'back' as const,
      part,
    })),
  ]
}

/** Compare by which parts are active; null and all-inactive are treated as equal. */
export function bodyAreasHaveSameSelection(a: BodyAreas, b: BodyAreas) {
  const same = (x: HumanState | null, y: HumanState | null) => {
    const left = new Set(activeParts(x))
    const right = activeParts(y)
    return left.size === right.length && right.every((part) => left.has(part))
  }
  return same(a.front, b.front) && same(a.back, b.back)
}

/** Parses the JSON the medical history stores for each view. */
export function parseBodyAreas(stored: {
  bodyFront?: unknown
  bodyBack?: unknown
}): BodyAreas {
  const parse = (value: unknown) =>
    typeof value === 'string' && value
      ? (JSON.parse(value) as HumanState)
      : null
  return { front: parse(stored.bodyFront), back: parse(stored.bodyBack) }
}
