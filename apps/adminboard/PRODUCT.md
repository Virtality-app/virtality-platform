# Product

<!-- impeccable:product-schema 1 -->

Product record for **Adminboard** (`apps/adminboard`), the internal admin dashboard. The shared core for the whole platform is in the root `PRODUCT.md`. This file repeats the parts that matter here, because Impeccable loads only this file inside the app.

## Platform

web

## Users

Only the Virtality team uses Adminboard. Access requires `role=admin`.

- **Founders and leadership.** They read the Dashboard and the Adoption & Engagement report as an executive snapshot of usage across clinics, and they manage customers, billing, and campaigns.
- **Engineering and ops.** They run the media bucket, exercises and immersive videos, headset inventory and provisioned devices, access and tester codes, translations, and user creation.
- **Marketing and content.** They manage website content (Highlight Cards for Benefits and Features, partner logos, promo video, Mosaic), blog Posts, Admin-authored Email, and Audiences.

There is no separate clinical team in Adminboard. Exercise and video authoring falls to the roles above.

## Product Purpose

Adminboard is the control room behind the Console and the website. It is where the team changes what clinicians can use (exercises, immersive videos, translations), what prospects read (landing content, blog), who has access and on what terms (codes, coupons, campaigns, entitlements), and how the business is doing (adoption and engagement). Success means a teammate can make a change safely, without engineering help, and knows exactly what it will affect before committing.

## Operating Context

- Desk work on a laptop or desktop, in English.
- **Sidebar groups** (`data/static/sidebar-nav.ts`): Overview (Dashboard, Adoption & Engagement), Bucket, Content, Resources (Exercises, Immersive Videos), Billing (Access Codes, Headset inventory, Coupon library, Campaign Window, Renew triggers, Customers), and Admin (Translations, Tester Codes, Create user).
- **High-consequence actions:** Final Send of an email is immediate and irreversible. Enable in Console makes an exercise visible to every clinician. Uploading an Addressables Catalog `.hash` makes a headset release live. Opt-outs can be recorded but never reversed.
- Vocabulary is defined in `apps/adminboard/CONTEXT.md`. Use those terms and avoid the listed synonyms.
- When a dropdown menu item opens a dialog, follow ADR 0002 (`docs/adr/0002-dropdown-dialog-pointer-events.md`).

## Capabilities and Constraints

- Next.js 16, React 19, Tailwind 4. Shared primitives come from `@virtality/ui`.
- English only. The Translations page is where Greek speakers approve or edit the Console's Greek drafts (ADR 0010). Adminboard itself is not translated.
- **Content ownership split:** Adminboard owns the copy and icon choice of Highlight Cards and the content of Posts and Authors. The website owns their presentation.
- The Adoption & Engagement report reports product-derived usage proxies, not validated clinical outcomes. Its disclaimer must stay.
- Bucket objects are never overwritten in place. A replacement creates a new object (Object Replacement).

## Brand Commitments

- **Name:** Virtality. This is an internal tool, so the voice is plain and operational. It says what an action does and what it affects.
- Email sent from here is wrapped in the locked Email Brand Shell. Admin-authored bodies follow the public voice in the root `PRODUCT.md`.

## Evidence on Hand

Adminboard edits content that the website publishes. The rule against inventing metrics, testimonials, clinic names, partners, or clinical claims in the root `PRODUCT.md` applies to everything authored here. Confirmed evidence is listed in `apps/website/PRODUCT.md`.

## Product Principles

1. **Show consequences before commit.** Every action that reaches clinicians, prospects, or inboxes says what it will change, and irreversible ones say so plainly.
2. **Safe by default.** No silent overwrites, no hidden bulk effects. Destructive and live-making actions take a deliberate step.
3. **Honest numbers.** Reports separate usage proxies from clinical outcomes and never dress one up as the other.
4. **Dense and scannable.** Tables, filters, and status do the work. This is a tool for people who use it often.
