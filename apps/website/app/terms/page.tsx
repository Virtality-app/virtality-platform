import LegalPdfViewer from '@/components/shared/legal-pdf-viewer'
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents'
import { buildPageMetadata } from '@/lib/page-metadata'

const termsOfService = LEGAL_DOCUMENTS.termsOfService

export const metadata = buildPageMetadata({
  title: termsOfService.title,
  description: "The terms for using Virtality's website and services.",
  path: '/terms',
})

const TermsOfServicePage = () => {
  return <LegalPdfViewer {...termsOfService} />
}

export default TermsOfServicePage
