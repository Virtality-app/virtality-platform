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
  },
  {
    name: 'privacy',
    pagePath: 'app/privacy/page.tsx',
    documentKey: 'privacyPolicy' as const,
    pdfAssetPath: 'legal/privacy-policy.pdf',
    pdfPath: '/legal/privacy-policy.pdf',
    downloadFileName: 'virtality-privacy-policy.pdf',
  },
]

describe('legal documents (PRD 132)', () => {
  it('defines static legal PDF assets for terms and privacy', () => {
    for (const {
      documentKey,
      pdfAssetPath,
      pdfPath,
      downloadFileName,
    } of legalPages) {
      const document = LEGAL_DOCUMENTS[documentKey]

      expect(document.pdfPath).toBe(pdfPath)
      expect(document.downloadFileName).toBe(downloadFileName)
      expect(publicAssetExists(pdfAssetPath)).toBe(true)
    }
  })

  it('renders legal pages with inline PDF embed and download fallback', () => {
    const viewer = readWebsiteFile('components/shared/legal-pdf-viewer.tsx')

    expect(viewer).toMatch(/<iframe/)
    expect(viewer).toMatch(/src=\{pdfPath\}/)
    expect(viewer).toMatch(/href=\{pdfPath\}/)
    expect(viewer).toMatch(/download=\{downloadFileName\}/)
    expect(viewer).toMatch(/Download \{title\} \(PDF\)/)

    for (const { pagePath, documentKey } of legalPages) {
      const page = readWebsiteFile(pagePath)

      expect(page).toMatch(new RegExp(`LEGAL_DOCUMENTS\\.${documentKey}`))
      expect(page).toMatch(/LegalPdfViewer/)
      expect(page).not.toMatch(/UnderConstruction/)
    }
  })
})
