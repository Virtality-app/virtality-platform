import LegalPdfViewer from '@/components/shared/legal-pdf-viewer'
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Virtality Privacy Policy.',
}

const PrivacyPolicyPage = () => {
  return <LegalPdfViewer {...LEGAL_DOCUMENTS.privacyPolicy} />
}

export default PrivacyPolicyPage
