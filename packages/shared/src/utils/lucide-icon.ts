const NON_ICON_EXPORTS = new Set(['Icon', 'createLucideIcon', 'icons'])

const REACT_FORWARD_REF = Symbol.for('react.forward_ref')

export function isRenderableLucideIcon(
  iconName: string,
  lucideModule: Record<string, unknown>,
): boolean {
  if (!iconName || NON_ICON_EXPORTS.has(iconName)) {
    return false
  }

  const exportValue = lucideModule[iconName]

  if (
    exportValue &&
    typeof exportValue === 'object' &&
    typeof (exportValue as { render?: unknown }).render === 'function' &&
    (exportValue as { $$typeof?: symbol }).$$typeof === REACT_FORWARD_REF
  ) {
    return true
  }

  return false
}
