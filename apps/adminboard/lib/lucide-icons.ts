import {
  isRenderableLucideIcon,
  resolveLucideIconFromModule,
} from '@virtality/shared/utils'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const lucideModule = LucideIcons as Record<string, unknown>

let cachedIconNames: string[] | null = null

/** Drop Lucide's `FooIcon` aliases when `Foo` is also exportable. */
function isPrimaryLucideIconName(name: string): boolean {
  if (!name.endsWith('Icon')) {
    return true
  }

  const baseName = name.slice(0, -'Icon'.length)
  return !baseName || !isRenderableLucideIcon(baseName, lucideModule)
}

export function listRenderableLucideIconNames(): string[] {
  if (cachedIconNames) {
    return cachedIconNames
  }

  cachedIconNames = Object.keys(LucideIcons)
    .filter((name) => isRenderableLucideIcon(name, lucideModule))
    .filter(isPrimaryLucideIconName)
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
