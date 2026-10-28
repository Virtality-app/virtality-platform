import {
  parseNearTermDirection,
  type NearTermDirection,
  type ProgramExerciseListSegment,
} from '@virtality/shared/utils'
import type { Exercise } from '@virtality/db'
import { CompleteExercise } from '@/types/models'
import {
  enabledMemberIds,
  segmentMembersFullyDeferred,
  type DeferredRemovalIdSet,
} from '@/lib/program-list-deferred-removal'

export const NEAR_TERM_SIDES: NearTermDirection[] = ['Left', 'Right']

/** One list row: a single exercise, or an adjacent Left/Right pair. */
export type SegmentRow = {
  key: string
  members: CompleteExercise[]
  isPair: boolean
  primary: CompleteExercise
  secondary: CompleteExercise | undefined
  primaryIndex: number
  secondaryIndex: number | undefined
  memberIds: string[]
  selectableMemberIds: string[]
  fullyDeferred: boolean
  familyDisplayName: string
  title: string
  showDirectionToggles: boolean
}

export function segmentRowKey(ex: CompleteExercise): {
  displayName: string
  direction: string
} {
  return {
    displayName: ex.exercise?.displayName ?? '',
    direction: ex.exercise?.direction ?? '',
  }
}

export function membersForSegment(
  exerciseList: CompleteExercise[],
  seg: ProgramExerciseListSegment,
): CompleteExercise[] {
  if (seg.kind === 'single') {
    return [exerciseList[seg.startIndex]!]
  }
  return [exerciseList[seg.startIndex]!, exerciseList[seg.startIndex + 1]!]
}

function catalogHasBilateralDirections(
  catalog: Exercise[] | undefined,
  displayName: string,
): boolean {
  const dirs = new Set<NearTermDirection>()
  for (const e of catalog ?? []) {
    if (e.displayName !== displayName) continue
    const d = parseNearTermDirection(e.direction)
    if (d) dirs.add(d)
  }
  return dirs.has('Left') && dirs.has('Right')
}

export function catalogVariantForDirection(
  catalog: Exercise[] | undefined,
  displayName: string,
  side: NearTermDirection,
): Exercise | undefined {
  return catalog?.find(
    (e) =>
      e.displayName === displayName &&
      parseNearTermDirection(e.direction) === side,
  )
}

export function programMemberForDirection(
  members: readonly CompleteExercise[],
  side: NearTermDirection,
): CompleteExercise | undefined {
  return members.find(
    (m) => parseNearTermDirection(m.exercise?.direction ?? '') === side,
  )
}

export function directionToggleAriaLabel(
  isEnabled: boolean,
  inProgram: boolean,
  side: NearTermDirection,
): string {
  if (isEnabled) return `Remove ${side} variant`
  if (inProgram) return `Restore ${side} variant`
  return `Add ${side} variant`
}

export function describeSegment(
  seg: ProgramExerciseListSegment,
  exerciseList: CompleteExercise[],
  catalog: Exercise[] | undefined,
  deferredRemoval: DeferredRemovalIdSet,
): SegmentRow {
  const members = membersForSegment(exerciseList, seg)
  const isPair = seg.kind === 'bilateral'
  const primary = members[0]!
  const secondary = members[1]
  const memberIds = members.map((m) => m.id)

  const primaryCatalog = catalog?.find((de) => de.id === primary.exerciseId)
  const familyDisplayName =
    primary.exercise?.displayName ?? primaryCatalog?.displayName ?? ''

  return {
    key: isPair ? `${primary.id}:${secondary!.id}` : primary.id,
    members,
    isPair,
    primary,
    secondary,
    primaryIndex: seg.startIndex,
    secondaryIndex: isPair ? seg.startIndex + 1 : undefined,
    memberIds,
    selectableMemberIds: enabledMemberIds(memberIds, deferredRemoval),
    fullyDeferred: segmentMembersFullyDeferred(memberIds, deferredRemoval),
    familyDisplayName,
    title: familyDisplayName || 'Exercise',
    showDirectionToggles: catalogHasBilateralDirections(
      catalog,
      familyDisplayName,
    ),
  }
}
