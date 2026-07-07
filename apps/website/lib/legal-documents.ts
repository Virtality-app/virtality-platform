export type LegalDocument = {
  title: string
  pdfPath: `/${string}`
  downloadFileName: string
}

export const LEGAL_DOCUMENTS = {
  termsOfService: {
    title: 'Terms of Service',
    pdfPath: '/legal/terms-of-service.pdf',
    downloadFileName: 'virtality-terms-of-service.pdf',
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    pdfPath: '/legal/privacy-policy.pdf',
    downloadFileName: 'virtality-privacy-policy.pdf',
  },
} as const satisfies Record<string, LegalDocument>
