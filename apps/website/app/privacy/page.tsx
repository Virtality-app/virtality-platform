import LegalPdfViewer from '@/components/shared/legal-pdf-viewer'
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents'
import { buildPageMetadata } from '@/lib/page-metadata'

const privacyPolicy = LEGAL_DOCUMENTS.privacyPolicy

export const metadata = buildPageMetadata({
  title: privacyPolicy.title,
  description: 'How Virtality collects, uses and protects your personal data.',
  path: '/privacy',
})

const PrivacyPolicyPage = () => {
  return <LegalPdfViewer {...privacyPolicy} />
}

export default PrivacyPolicyPage
