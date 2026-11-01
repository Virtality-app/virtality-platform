import type { Translate } from '@/i18n/translate'

/** "lower back", "thera-band" → "lower_back", "thera_band". */
const catalogKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')

const titleCase = (value: string) =>
  value
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

/**
 * Categories and equipment are free text on each exercise, so a value the
 * catalog does not know yet shows title-cased instead of as a raw key.
 */
export function bodyPartChipLabel(t: Translate, category: string): string {
  return t(`exerciseLibrary.bodyPart.${catalogKey(category)}`, {
    ns: 'shared',
    defaultValue: titleCase(category),
  })
}

export function equipmentChipLabel(t: Translate, key: string): string {
  return t(`exerciseLibrary.equipment.${catalogKey(key)}`, {
    ns: 'shared',
    defaultValue: titleCase(key),
  })
}
