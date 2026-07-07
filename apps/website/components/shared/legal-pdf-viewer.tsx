import type { LegalDocument } from '@/lib/legal-documents'
import { Download } from 'lucide-react'
import Link from 'next/link'

const LegalPdfViewer = ({
  title,
  pdfPath,
  downloadFileName,
}: LegalDocument) => {
  return (
    <section className='container mx-auto px-4 py-10 md:px-8 md:py-14'>
      <div className='mx-auto max-w-5xl space-y-6'>
        <div className='space-y-3 text-center'>
          <h1 className='text-4xl font-bold text-gray-900 md:text-5xl'>
            {title}
          </h1>
          <p className='text-gray-600'>
            Review the document below. If your browser cannot display the PDF,
            download the original file instead.
          </p>
          <Link
            href={pdfPath}
            download={downloadFileName}
            className='inline-flex items-center gap-2 text-sm font-medium text-vital-blue-700 hover:text-[#077a89]'
          >
            <Download className='size-4' aria-hidden='true' />
            Download {title} (PDF)
          </Link>
        </div>
        <iframe
          src={pdfPath}
          title={title}
          className='h-[min(80vh,1100px)] w-full rounded-lg border border-vital-blue-700/20 bg-white shadow-sm'
        />
      </div>
    </section>
  )
}

export default LegalPdfViewer
