import type { LegalDocument } from '@/lib/legal-documents'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

const LegalPdfViewer = ({ title, pdfPath, pageImages }: LegalDocument) => {
  return (
    <section className='container mx-auto px-4 py-10 md:px-8 md:py-14'>
      <div className='mx-auto max-w-5xl space-y-6'>
        <div className='space-y-3 text-center'>
          <h1 className='text-4xl font-bold text-gray-900 md:text-5xl'>
            {title}
          </h1>
          <p className='text-gray-600'>
            Review the document below. If your browser cannot display the PDF,
            open the original file instead.
          </p>
          <Link
            href={pdfPath}
            className='inline-flex items-center gap-2 text-sm font-medium text-vital-blue-700 hover:text-[#077a89]'
          >
            <ExternalLink className='size-4' aria-hidden='true' />
            Open {title} (PDF)
          </Link>
        </div>
        <div
          aria-label={title}
          className='h-[min(80vh,1100px)] overflow-y-auto rounded-lg border border-vital-blue-700/20 bg-gray-100 p-4 shadow-sm'
        >
          <div className='mx-auto flex max-w-4xl flex-col gap-4'>
            {pageImages.map((pageImage, index) => (
              <img
                key={pageImage}
                src={pageImage}
                alt={`${title} page ${index + 1}`}
                className='w-full rounded-sm bg-white shadow-sm'
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LegalPdfViewer
