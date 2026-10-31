/**
 * Supplemental therapy names are stored as database keys ("manual_therapy",
 * "pnf"). These map them to a translation key and to a readable fallback for
 * names the Translation Catalog does not list yet.
 */

export function supplementalTherapyKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

export function supplementalTherapyTranslationKey(name: string): string {
  return `sessionDialog.therapies.${supplementalTherapyKey(name)}`
}

export function supplementalTherapyFallbackLabel(name: string): string {
  const words = supplementalTherapyKey(name).split('_').filter(Boolean)
  const label = words.join(' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}
