import { normalizeExerciseEquipmentKey } from '@virtality/shared/utils'

/**
 * Maps exercise items strings to public equipment assets.
 * Unknown items fall back to the bodyweight icon.
 */
export function equipmentIconSrcForItem(item: string): string | null {
  const k = normalizeExerciseEquipmentKey(item)
  if (k === 'rope') return '/assets/equipment/ROPE_ICON.png'
  if (k === 'small_ball') return '/assets/equipment/SMALL_BALLS_ICON.png'
  if (k.includes('dumbbells')) return '/assets/equipment/DUMBELL_ICON.png'
  if (k.includes('bar')) return '/assets/equipment/BAR_ICON.png'
  if (k.includes('thera-band')) return '/assets/equipment/THERA_BAND_ICON.png'
  if (k.includes('bodyweight')) return '/assets/equipment/BODYWEIGHT_ICON.png'
  return '/assets/equipment/BODYWEIGHT_ICON.png'
}
