import {
  familyMemberForNearTermDirection,
  type DirectionBadgeHighlight,
  type ExerciseFamilyForLibrary,
  type ExerciseLibraryFilterRow,
} from '@virtality/shared/utils'

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
