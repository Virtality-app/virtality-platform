import type { SessionRecordingOptions } from 'posthog-js'

/**
 * Marks patient and clinician data. Session replays mask its text and hide its
 * images, and autocapture drops its text. Use it on anything that shows a
 * name, contact detail, photo, medical history or session note.
 */
export const SENSITIVE_CLASS = 'ph-sensitive'

/**
 * PostHog's own class. Hides the element from replays entirely and stops
 * autocapture on it. Use it where personal data sits in an attribute (an
 * aria-label or title holding a patient name), which text masking misses.
 */
export const HIDDEN_CLASS = 'ph-no-capture'

/**
 * Shows an input's value in replays. Every input is masked unless it carries
 * this attribute, so only add it to inputs that never hold personal data,
 * such as exercise settings.
 */
export const UNMASK_ATTRIBUTE = 'data-ph-unmask'

export const unmaskedInputProps = { [UNMASK_ATTRIBUTE]: '' } as const

export function maskReplayInput(value: string, element?: HTMLElement): string {
  const unmasked =
    element?.closest(`[${UNMASK_ATTRIBUTE}]`) &&
    !element.closest(`.${SENSITIVE_CLASS}`) &&
    element.getAttribute('type') !== 'password'
  return unmasked ? value : '*'.repeat(value.length)
}

export const replayPrivacyOptions: SessionRecordingOptions = {
  maskAllInputs: true,
  maskInputFn: maskReplayInput,
  maskTextSelector: `.${SENSITIVE_CLASS}`,
  blockSelector: `.${SENSITIVE_CLASS} img, img.${SENSITIVE_CLASS}`,
}
