import { hasEnabledVariantsForSubmit } from './program-submit-enabled-variants'

/** Continue and Save Program require at least one non-deferred variant. */
export function canQuickStartFinalAction(
  variants: readonly { id: string }[],
  deferredRemovalIds: readonly string[],
): boolean {
  return hasEnabledVariantsForSubmit(variants, deferredRemovalIds)
}
