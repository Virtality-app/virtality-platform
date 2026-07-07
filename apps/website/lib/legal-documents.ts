export type LegalDocument = {
  title: string
  pdfPath: `/${string}`
  downloadFileName: string
}

function createLegalDocument(
  title: string,
  pdfFileName: `${string}.pdf`,
): LegalDocument {
  return {
    title,
    pdfPath: `/legal/${pdfFileName}`,
    downloadFileName: `virtality-${pdfFileName}`,
  }
}

export const LEGAL_DOCUMENTS = {
  termsOfService: createLegalDocument(
    'Terms of Service',
    'terms-of-service.pdf',
  ),
  privacyPolicy: createLegalDocument('Privacy Policy', 'privacy-policy.pdf'),
} as const satisfies Record<string, LegalDocument>

export function legalDocumentPageDescription(document: LegalDocument): string {
  return `Virtality ${document.title}.`
}
