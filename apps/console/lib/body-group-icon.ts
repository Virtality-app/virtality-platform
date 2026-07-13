/**
 * Maps exercise category strings to public body-group SVG assets.
 * Unknown categories return null (caller shows text-only chip).
 */
export function bodyGroupIconSrcForCategory(category: string): string | null {
  const k = category.toLowerCase()
  if (k.includes('forearm')) return '/assets/body-groups/FOREARMS_ICON.svg'
  if (k.includes('wrist')) return '/assets/body-groups/WRIST_ICON.svg'
  if (k.includes('shoulder')) return '/assets/body-groups/SHOULDERS_ICON.svg'
  if (k.includes('knee')) return '/assets/body-groups/KNEE_ICON.svg'
  return null
}
