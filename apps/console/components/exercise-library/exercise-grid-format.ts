import {
  familyMemberForNearTermDirection,
  type DirectionBadgeHighlight,
  type ExerciseFamilyForLibrary,
  type ExerciseLibraryFilterRow,
} from '@virtality/shared/utils'

export function equipmentChipLabel(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function directionBadgesWithSelection<
  T extends ExerciseLibraryFilterRow,
>(
  family: ExerciseFamilyForLibrary<T>,
  isSelected: Record<string, boolean> | null | undefined,
): DirectionBadgeHighlight[] | undefined {
  if (family.directionBadges.length === 0) return undefined
  return family.directionBadges.map((badge) => {
    const member = familyMemberForNearTermDirection(family, badge.side)
    return {
      ...badge,
      selected: member ? Boolean(isSelected?.[member.id]) : false,
    }
  })
}
