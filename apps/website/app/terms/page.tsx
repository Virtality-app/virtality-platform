import LegalPdfViewer from '@/components/shared/legal-pdf-viewer'
import {
  LEGAL_DOCUMENTS,
  legalDocumentPageDescription,
} from '@/lib/legal-documents'
import type { Metadata } from 'next'

const termsOfService = LEGAL_DOCUMENTS.termsOfService

export const metadata: Metadata = {
  title: termsOfService.title,
  description: legalDocumentPageDescription(termsOfService),
}

const TermsOfServicePage = () => {
  return <LegalPdfViewer {...termsOfService} />
}

export default TermsOfServicePage
