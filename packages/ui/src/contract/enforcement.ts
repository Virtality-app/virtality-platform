import { PROMOTED_COMPONENTS, type PromotedComponent } from './index.ts'

/** Apps that host Local App UI and consume promoted shared components. */
export const SHARED_UI_CONSUMER_APPS = [
  'console',
  'website',
  'adminboard',
] as const

export type SharedUiConsumerApp = (typeof SHARED_UI_CONSUMER_APPS)[number]

/** Regex matching disallowed local imports for a promoted component name. */
export function localPromotedImportPattern(name: PromotedComponent): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(
    `from ['"](?:@/components/ui/${escaped}|(?:\\.\\./)+(?:components/)?ui/${escaped})['"]`,
  )
}

export function localPromotedImportPatterns(): RegExp[] {
  return PROMOTED_COMPONENTS.map((name) => localPromotedImportPattern(name))
}

/**
 * Deprecated Local App UI shims must re-export only — no new implementations.
 */
export function isDeprecatedReExportShim(
  source: string,
  name: PromotedComponent,
): boolean {
  if (!source.includes('@deprecated')) return false
  if (!source.includes(`@virtality/ui/components/${name}`)) return false
  if (/\bfunction\s+[A-Z]/.test(source)) return false
  if (/forwardRef/.test(source)) return false
  if (/\bcva\s*\(/.test(source)) return false
  return true
}
