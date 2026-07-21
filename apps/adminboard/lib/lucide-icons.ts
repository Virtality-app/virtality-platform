import { isRenderableLucideIcon } from '@virtality/shared/utils'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const lucideModule = LucideIcons as Record<string, unknown>

let cachedIconNames: string[] | null = null

export function listRenderableLucideIconNames(): string[] {
  if (cachedIconNames) {
    return cachedIconNames
  }

  cachedIconNames = Object.keys(LucideIcons)
    .filter((name) => isRenderableLucideIcon(name, lucideModule))
    .sort((left, right) => left.localeCompare(right))

  return cachedIconNames
}

export function resolveLucideIconComponent(
  iconName: string,
): LucideIcon | null {
  if (!isRenderableLucideIcon(iconName, lucideModule)) {
    return null
  }

  return lucideModule[iconName] as LucideIcon
}
