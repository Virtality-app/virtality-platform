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

describe('PRD 132 embed legal PDFs on website terms and privacy pages', () => {
  it('defines static legal PDF assets for terms and privacy', () => {
    expect(LEGAL_DOCUMENTS.termsOfService.pdfPath).toBe(
      '/legal/terms-of-service.pdf',
    )
    expect(LEGAL_DOCUMENTS.privacyPolicy.pdfPath).toBe(
      '/legal/privacy-policy.pdf',
    )
    expect(publicAssetExists('legal/terms-of-service.pdf')).toBe(true)
    expect(publicAssetExists('legal/privacy-policy.pdf')).toBe(true)
  })

  it('renders the terms page with inline PDF embed and download fallback', () => {
    const termsPage = readWebsiteFile('app/terms/page.tsx')
    const viewer = readWebsiteFile('components/shared/legal-pdf-viewer.tsx')

    expect(termsPage).toMatch(/LEGAL_DOCUMENTS\.termsOfService/)
    expect(termsPage).toMatch(/LegalPdfViewer/)
    expect(viewer).toMatch(/<iframe/)
    expect(viewer).toMatch(/download=\{downloadFileName\}/)
    expect(viewer).toMatch(/Download \{title\} \(PDF\)/)
  })

  it('renders the privacy page with inline PDF embed and download fallback', () => {
    const privacyPage = readWebsiteFile('app/privacy/page.tsx')
    const viewer = readWebsiteFile('components/shared/legal-pdf-viewer.tsx')

    expect(privacyPage).toMatch(/LEGAL_DOCUMENTS\.privacyPolicy/)
    expect(privacyPage).toMatch(/LegalPdfViewer/)
    expect(viewer).toMatch(/src=\{pdfPath\}/)
    expect(viewer).toMatch(/href=\{pdfPath\}/)
  })

  it('does not keep the under-construction placeholder on legal routes', () => {
    const termsPage = readWebsiteFile('app/terms/page.tsx')
    const privacyPage = readWebsiteFile('app/privacy/page.tsx')

    expect(termsPage).not.toMatch(/UnderConstruction/)
    expect(privacyPage).not.toMatch(/UnderConstruction/)
  })
})
