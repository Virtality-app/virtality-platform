# Follow-up PRD: Adminboard-managed marketing content

Parent: [PRD #133 — Redesign website landing page around clinic-owner conversion](https://github.com/Steliospne/virtality-platform/issues/133)

Issue: [#139 — Specify Adminboard-managed marketing content follow-up](https://github.com/Steliospne/virtality-platform/issues/139)

## Problem statement

PRD #133 shipped partner and press credibility sections as **data-ready but static** arrays in `apps/website/lib/partner-press-content.ts`. Colleagues still need developer help to add, remove, or replace clinic logos, partner logos, press logos, and press article links.

This follow-up defines the product and technical slice that moves that content into Adminboard while reusing the platform's existing **Bucket Object** and **CDN URL** concepts.

## Managed content types

Adminboard manages four ordered marketing logo collections for the public landing page:

| Content type               | Landing section | Row / grouping           | Logo required                | External link   |
| -------------------------- | --------------- | ------------------------ | ---------------------------- | --------------- |
| **Strategic partner logo** | Supported by    | Strategic row            | yes                          | no              |
| **Clinical partner logo**  | Supported by    | Clinical partners row    | yes                          | no              |
| **Press logo**             | Press           | Single press grid        | yes                          | optional        |
| **Press link**             | Press           | Stored on the press item | n/a (paired with press logo) | optional `href` |

Notes:

- **Clinical partner logos** are the clinic credibility logos called out in PRD #133 user story 44 ("clinic logos").
- **Strategic partner logos** cover institutional or programme partners shown above the clinical row.
- A **press item** is one press logo plus optional metadata (alt text, display flags, article URL). Press logos and press links are edited together as a single Adminboard record, not as unrelated assets.
- Section eyebrow, title, and intro copy (`SUPPORTED_BY_CONTENT`, `PRESS_SECTION_CONTENT`) remain **code-owned** for this slice unless a later PRD expands scope.

## Bucket Object and CDN URL reuse

### Storage model

Each managed logo stores a **Bucket Object** reference, not a pasted external URL.

| Field       | Purpose                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| `objectKey` | Canonical bucket object key selected in Adminboard                                       |
| `cdnUrl`    | Derived at read/render time via `bucketCdnUrl(objectKey)` from `@virtality/shared/utils` |

Adminboard must **not** accept arbitrary external image URLs for these records. Logo selection reuses the existing **bucket object picker** pattern (`BucketObjectPickerDialog`, `filterBucketImagePickerObjects`) already used for Admin-authored email image blocks.

### Upload and folder conventions

- Recommended prefix: `marketing/logos/`
- Optional subfolders by type: `marketing/logos/strategic/`, `marketing/logos/clinical/`, `marketing/logos/press/`
- Uploads use the shared bucket upload procedures and strict URL-safe object keys described in `apps/adminboard/docs/adr/0001-bucket-manager-architecture.md`.

### Object Replacement

Logo updates follow **Object Replacement**: replacing image bytes creates a **new object key** instead of overwriting the CDN URL at the existing key. Marketing records therefore store `objectKey` and resolve `cdnUrl` at render time.

When an admin replaces a referenced bucket object from the bucket manager, the follow-up implementation should either:

1. **Update marketing records** that reference the replaced source key to the new key (preferred when reference detection is reliable), or
2. **Warn and require re-selection** in the marketing editor when the stored key no longer exists.

Bucket deletion must surface **referenced bucket object** warnings when a logo key is still used by a published marketing record.

## Partner logos vs press posts and links

### Partner logos (strategic and clinical)

- Purpose: static credibility marks in the **Supported by** section.
- Fields: `objectKey`, `alt`, optional display flags (`wide`, `compact`, `className` mapping).
- **Does not link** to an external destination. Partner logos render as non-interactive images (current `CredibilityLogo` behavior).
- Strategic and clinical items are separate ordered lists. The website continues to use `getVisiblePartnerRows` so empty rows and the whole Supported by section stay hidden when no valid logos exist.

### Press posts (logo + link)

- Purpose: media credibility in the separate **Press** section after Supported by and before the final CTA.
- Fields: `objectKey`, `alt`, optional `href`, optional display flags.
- When `href` is present, the press logo is wrapped in an anchor that opens the article in a **new tab** with `rel="noopener noreferrer"` (current `getPressLinkProps` behavior).
- When `href` is absent, the press logo renders without a link (logo-only placement until a URL is supplied).
- Press items are an ordered list independent from partner rows. The Press section is hidden when `hasPressSection` is false.

## Website rendering behavior

Once managed content exists, the public landing page should behave exactly as PRD #136 tests already require—only the **data source** changes.

### Data flow

1. Website loads published marketing records from a read-only public API (or server component data fetch).
2. Records map into the existing `CredibilityLogoItem` / `PressLogoItem` shapes in `apps/website/lib/partner-press-content.ts`.
3. `src` on each item is set from `bucketCdnUrl(objectKey)` (or the API returns a resolved `cdnUrl` computed the same way).
4. `apps/website/components/home/powered-by.tsx` and `press.tsx` keep using `getVisiblePartnerRows`, `filterValidLogoItems`, `hasPressSection`, and `getPressLinkProps` without markup changes.

### Visibility and validation rules (unchanged from PRD #136)

- `filterValidLogoItems` drops items missing both a resolvable logo `src` and non-empty `alt`.
- Partner rows render only when that row has at least one valid logo.
- The entire Supported by section is omitted when `hasPartnerSection` is false.
- The Press section is omitted when `hasPressSection` is false.
- Press items with URLs open in a new tab.

### Publishing and caching

- Adminboard edits are not live until **published** (draft/publish or immediate-save with `publishedAt`—see open decisions).
- The website should revalidate on a short interval or on publish webhooks so logo changes appear without redeploying static arrays.

### Migration from static arrays

- Initial migration seeds empty collections or imports any assets already uploaded to the bucket.
- `STRATEGIC_PARTNER_LOGOS`, `CLINICAL_PARTNER_LOGOS`, and `PRESS_LOGO_ITEMS` static exports are removed once the API is live; components read from fetched data instead.

## Adminboard scope (implementation slices)

Suggested build order for a future implementation issue:

1. **Database models** — `MarketingPartnerLogo` (kind: strategic | clinical) and `MarketingPressItem` with `objectKey`, `alt`, `href?`, display flags, `sortOrder`, publish metadata.
2. **oRPC procedures** — admin CRUD + public list endpoint returning only published items.
3. **Adminboard UI** — marketing content page with ordered lists, bucket object picker per logo, and separate editors for partner vs press items.
4. **Website integration** — replace static arrays with fetch + map helpers; keep `partner-press.ts` pure helpers.

## Open decisions requiring human product or content input

The following need explicit product or marketing owner answers before implementation:

1. **Logo assets** — Which strategic partners, clinic logos, and press outlets will be uploaded first? PRD #133 noted eight missing clinic logos and unspecified press coverage; no fabricated names or URLs should be seeded.
2. **Display order** — Default sort is manual `sortOrder` in Adminboard; confirm whether alphabetical or "featured first" rules are needed.
3. **Publish workflow** — Immediate save vs draft/publish gate for website visibility.
4. **Object Replacement propagation** — Auto-update marketing `objectKey` when bucket manager replaces an object, or require manual re-pick in the marketing editor.
5. **Section copy** — Whether Supported by / Press headings and intro paragraphs should eventually be Adminboard-editable or remain developer-owned constants.
6. **Revalidation target** — Acceptable staleness between publish and website update (ISR seconds, on-demand revalidate, or webhook).

## Out of scope for this follow-up

- Editing hero, benefits, pilot-proof, capabilities, or CTA copy through Adminboard.
- Arbitrary external image URLs bypassing the bucket.
- Blog posts, case studies, pricing, or non-landing marketing pages.
- Inventing partner names, press outlets, or article URLs during implementation.

## Testing expectations for the implementation issue

- Reuse and extend `apps/website/lib/partner-press-prd.test.ts` visibility and link behavior against API-mapped data.
- Add Adminboard CRUD and publish-state tests.
- Add mapping tests from marketing records (`objectKey`) to website `CredibilityLogoItem` / `PressLogoItem` with `bucketCdnUrl`.
- Verify referenced-object warnings when deleting or replacing bucket keys used by published logos.
