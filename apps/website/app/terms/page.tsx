import LegalPdfViewer from '@/components/shared/legal-pdf-viewer'
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Virtality Terms of Service.',
}

const TermsOfServicePage = () => {
  return <LegalPdfViewer {...LEGAL_DOCUMENTS.termsOfService} />
}

export default TermsOfServicePage
