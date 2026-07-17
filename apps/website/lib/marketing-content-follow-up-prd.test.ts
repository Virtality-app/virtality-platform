import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))

const FOLLOW_UP_SPEC_PATH =
  'docs/prd/0139-adminboard-managed-marketing-content.md'

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

function expectSpecToMatch(spec: string, patterns: readonly RegExp[]): void {
  for (const pattern of patterns) {
    expect(spec, pattern.toString()).toMatch(pattern)
  }
}

const followUpSpec = readRepoFile(FOLLOW_UP_SPEC_PATH)

const managedContentTypePatterns = [
  /strategic partner logo/i,
  /clinical partner logo/i,
  /press logo/i,
  /press link/i,
] as const

const bucketObjectReusePatterns = [
  /Bucket Object/i,
  /CDN URL/i,
  /objectKey/i,
  /bucketCdnUrl/i,
  /Object Replacement/i,
  /BucketObjectPickerDialog|bucket object picker/i,
] as const

const partnerVsPressPatterns = [
  /partner logo/i,
  /press/i,
  /href/i,
  /Supported by/i,
  /does not.*link|no external link|not link/i,
  /new tab/i,
] as const

const websiteRenderingPatterns = [
  /filterValidLogoItems/i,
  /getVisiblePartnerRows/i,
  /hasPressSection|hasPartnerSection/i,
  /hide|hidden/i,
  /partner-press-content/i,
] as const

const openDecisionPatterns = [
  /open decision|product input|content input|requires human/i,
  /logo assets|press coverage|sort order|display order/i,
] as const

describe('PRD 139 Adminboard-managed marketing content follow-up specification', () => {
  it('defines which marketing content types Adminboard manages', () => {
    expectSpecToMatch(followUpSpec, managedContentTypePatterns)
  })

  it('explains how Bucket Objects and CDN URLs are reused for logos', () => {
    expectSpecToMatch(followUpSpec, bucketObjectReusePatterns)
  })

  it('distinguishes partner logos from press posts and links', () => {
    expectSpecToMatch(followUpSpec, partnerVsPressPatterns)
  })

  it('identifies website rendering behavior once managed content exists', () => {
    expectSpecToMatch(followUpSpec, websiteRenderingPatterns)
  })

  it('calls out decisions still requiring human product or content input', () => {
    expectSpecToMatch(followUpSpec, openDecisionPatterns)
  })
})
