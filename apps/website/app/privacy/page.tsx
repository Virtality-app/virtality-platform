import LegalPdfViewer from '@/components/shared/legal-pdf-viewer'
import {
  LEGAL_DOCUMENTS,
  legalDocumentPageDescription,
} from '@/lib/legal-documents'
import type { Metadata } from 'next'

const privacyPolicy = LEGAL_DOCUMENTS.privacyPolicy

export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: legalDocumentPageDescription(privacyPolicy),
}

const PrivacyPolicyPage = () => {
  return <LegalPdfViewer {...privacyPolicy} />
}

export default PrivacyPolicyPage
