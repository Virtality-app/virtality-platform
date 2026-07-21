import {
  isRenderableLucideIcon,
  type LucideModule,
} from '@virtality/shared/utils'

export function resolveHighlightCardIcon(
  iconName: string | undefined,
  lucideModule: LucideModule,
): LucideModule[string] | null {
  if (!iconName || !isRenderableLucideIcon(iconName, lucideModule)) {
    return null
  }

  return lucideModule[iconName]
}
