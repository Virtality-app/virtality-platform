import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const specPath = join(
  repoRoot,
  'docs/prd/0139-adminboard-managed-marketing-content.md',
)

function readFollowUpSpec(): string {
  return readFileSync(specPath, 'utf8')
}

describe('PRD 139 Adminboard-managed marketing content follow-up specification', () => {
  it('defines which marketing content types Adminboard manages', () => {
    const spec = readFollowUpSpec()

    expect(spec).toMatch(/strategic partner logo/i)
    expect(spec).toMatch(/clinical partner logo/i)
    expect(spec).toMatch(/press logo/i)
    expect(spec).toMatch(/press link/i)
  })

  it('explains how Bucket Objects and CDN URLs are reused for logos', () => {
    const spec = readFollowUpSpec()

    expect(spec).toMatch(/Bucket Object/i)
    expect(spec).toMatch(/CDN URL/i)
    expect(spec).toMatch(/objectKey/i)
    expect(spec).toMatch(/bucketCdnUrl/i)
    expect(spec).toMatch(/Object Replacement/i)
    expect(spec).toMatch(/BucketObjectPickerDialog|bucket object picker/i)
  })

  it('distinguishes partner logos from press posts and links', () => {
    const spec = readFollowUpSpec()

    expect(spec).toMatch(/partner logo/i)
    expect(spec).toMatch(/press/i)
    expect(spec).toMatch(/href/i)
    expect(spec).toMatch(/Supported by/i)
    expect(spec).toMatch(/does not.*link|no external link|not link/i)
    expect(spec).toMatch(/new tab/i)
  })

  it('identifies website rendering behavior once managed content exists', () => {
    const spec = readFollowUpSpec()

    expect(spec).toMatch(/filterValidLogoItems/i)
    expect(spec).toMatch(/getVisiblePartnerRows/i)
    expect(spec).toMatch(/hasPressSection|hasPartnerSection/i)
    expect(spec).toMatch(/hide|hidden/i)
    expect(spec).toMatch(/partner-press-content/i)
  })

  it('calls out decisions still requiring human product or content input', () => {
    const spec = readFollowUpSpec()

    expect(spec).toMatch(
      /open decision|product input|content input|requires human/i,
    )
    expect(spec).toMatch(/logo assets|press coverage|sort order|display order/i)
  })
})
