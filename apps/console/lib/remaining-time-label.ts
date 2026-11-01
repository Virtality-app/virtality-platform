import { remainingTimeParts } from '@virtality/shared/utils'
import type { Translate } from '@/i18n/translate'

/** Remaining Time in the clinician's language, from the `layout` namespace. */
export function remainingTimeLabel(t: Translate, remainingMs: number): string {
  const parts = remainingTimeParts(remainingMs)
  if (parts.length === 0) return t('remainingTime.expired', { ns: 'layout' })
  return parts
    .map(({ unit, value }) =>
      t(`remainingTime.units.${unit}`, { ns: 'layout', count: value }),
    )
    .join(' ')
}
