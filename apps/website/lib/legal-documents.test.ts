import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS } from './legal-documents'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

function publicAssetExists(relativePath: string): boolean {
  return existsSync(join(websiteRoot, 'public', relativePath))
}

const legalPages = [
  {
    name: 'terms',
    pagePath: 'app/terms/page.tsx',
    documentKey: 'termsOfService' as const,
    pdfAssetPath: 'legal/terms-of-service.pdf',
    pdfPath: '/legal/terms-of-service.pdf',
    downloadFileName: 'virtality-terms-of-service.pdf',
    pageImages: Array.from(
      { length: 7 },
      (_, index) => `/legal/terms-of-service-pages/page-${index + 1}.png`,
    ),
  },
  {
    name: 'privacy',
    pagePath: 'app/privacy/page.tsx',
    documentKey: 'privacyPolicy' as const,
    pdfAssetPath: 'legal/privacy-policy.pdf',
    pdfPath: '/legal/privacy-policy.pdf',
    downloadFileName: 'virtality-privacy-policy.pdf',
    pageImages: Array.from(
      { length: 5 },
      (_, index) => `/legal/privacy-policy-pages/page-${index + 1}.png`,
    ),
  },
]

describe('legal documents (PRD 132)', () => {
  it('defines static legal PDF assets for terms and privacy', () => {
    for (const {
      documentKey,
      pdfAssetPath,
      pdfPath,
      downloadFileName,
      pageImages,
    } of legalPages) {
      const document = LEGAL_DOCUMENTS[documentKey]

      expect(document.pdfPath).toBe(pdfPath)
      expect(document.downloadFileName).toBe(downloadFileName)
      expect(document.pageImages).toEqual(pageImages)
      expect(publicAssetExists(pdfAssetPath)).toBe(true)
      for (const pageImage of pageImages) {
        expect(publicAssetExists(pageImage.replace(/^\//, ''))).toBe(true)
      }
    }
  })

  it('renders legal pages with inline PDF embed and download fallback', () => {
    const viewer = readWebsiteFile('components/shared/legal-pdf-viewer.tsx')

    expect(viewer).toMatch(/pageImages\.map/)
    expect(viewer).toMatch(/<img/)
    expect(viewer).toMatch(/src=\{pageImage\}/)
    expect(viewer).not.toMatch(/<object/)
    expect(viewer).not.toMatch(/<iframe/)
    expect(viewer).toMatch(/href=\{pdfPath\}/)
    expect(viewer).not.toMatch(/download=\{downloadFileName\}/)
    expect(viewer).toMatch(/Open \{title\} \(PDF\)/)

    for (const { pagePath, documentKey } of legalPages) {
      const page = readWebsiteFile(pagePath)

      expect(page).toMatch(new RegExp(`LEGAL_DOCUMENTS\\.${documentKey}`))
      expect(page).toMatch(/LegalPdfViewer/)
      expect(page).not.toMatch(/UnderConstruction/)
    }
  })
})
