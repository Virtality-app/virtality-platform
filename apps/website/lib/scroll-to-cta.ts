export const FINAL_CTA_ELEMENT_ID = 'cta' as const

export function scrollToFinalCta(): void {
  document
    .getElementById(FINAL_CTA_ELEMENT_ID)
    ?.scrollIntoView({ behavior: 'smooth' })
}
