import {
  isRenderableLucideIcon,
  resolveLucideIconFromModule,
} from '@virtality/shared/utils'
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
  return resolveLucideIconFromModule(
    iconName,
    lucideModule,
  ) as LucideIcon | null
}
