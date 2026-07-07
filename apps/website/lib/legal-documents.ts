export type LegalDocument = {
  title: string
  pdfPath: `/${string}`
  downloadFileName: string
  pageImages: string[]
}

function createLegalDocument(
  title: string,
  pdfFileName: `${string}.pdf`,
  pageCount: number,
): LegalDocument {
  const imageDirectory = pdfFileName.replace(/\.pdf$/, '-pages')

  return {
    title,
    pdfPath: `/legal/${pdfFileName}`,
    downloadFileName: `virtality-${pdfFileName}`,
    pageImages: Array.from(
      { length: pageCount },
      (_, index) => `/legal/${imageDirectory}/page-${index + 1}.png`,
    ),
  }
}

export const LEGAL_DOCUMENTS = {
  termsOfService: createLegalDocument(
    'Terms of Service',
    'terms-of-service.pdf',
    7,
  ),
  privacyPolicy: createLegalDocument('Privacy Policy', 'privacy-policy.pdf', 5),
} as const satisfies Record<string, LegalDocument>

export function legalDocumentPageDescription(document: LegalDocument): string {
  return `Virtality ${document.title}.`
}
