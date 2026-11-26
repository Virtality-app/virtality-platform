# Product

<!-- impeccable:product-schema 1 -->

Product record for the public **website** (`apps/website`). The shared core for the whole platform is in the root `PRODUCT.md`. This file repeats the parts that matter here, because Impeccable loads only this file inside the app.

## Platform

web

## Users

- **Primary: prospective clinics.** Private physiotherapy clinic owners and lead physiotherapists, Greek clinics first, deciding whether Virtality belongs in their practice.
- **Also:** press, partners, investors, and the wider physiotherapy community who follow Virtality's work through the blog and press coverage.
- **Existing contacts** reach `/email-preferences` from emails to manage Topic opt-outs.

## Product Purpose

The website turns interest into a trial or a conversation, and shows what Virtality has achieved. Its goals, in order of weight:

1. **Free trial sign-up:** start the two-week free trial in the Console.
2. **Book a 20-minute demo.**
3. **Show the work:** clinic results, achievements, press, and the latest news through the blog.

The waitlist (`/waitlist`) still exists, but it is no longer the main path.

## Positioning

Virtality's core claim is neuro-driven movement. The VR environment gets patients past pain fear and muscle compensation, so they move more fully and naturally than in standard exercise. That retrains movement and recovers range of motion that had stalled: in pilot cases, shoulders that hadn't progressed for months reached full range within two or three sessions. A generic VR exercise product can't truthfully make this claim. Clinic capacity and clinician control support it but don't lead.

## Operating Context

- **Routes:** landing (`/`), blog index and Posts (`/blog`, `/blog/[id]`), contact, waitlist, thank-you, email preferences, privacy, and terms.
- The landing page is composed from sections in `sections/`: Hero, Benefits grid, Benefits, Features, Testimonials, Mosaic, Promo video, Supported by, and Call to action. Each section owns its UI and copy (see `apps/website/CONTEXT.md`).
- **Content managed in Adminboard:** Highlight Cards (Benefits, Features), partner logos, promo video, Mosaic, and blog Posts and Authors. The website owns their presentation, and Adminboard owns their content.
- Page metadata, canonical URLs, and JSON-LD come from `lib/page-metadata.ts` and `lib/json-ld.ts`.

## Capabilities and Constraints

- Next.js 16, React 19, Tailwind 4. Shared primitives come from `@virtality/ui`.
- English only for now. International reach is a goal, and Greek clinics are the first market.
- No login on this app. The trial CTA hands off to Console sign-up.
- Blog Posts are plain structured Body Blocks (paragraph, heading, image, video), and layout owns sizing.

## Brand Commitments

- **Name:** Virtality. **Tagline:** "Because every move matters."
- **Voice:** confident, clinical, and outcome-focused, framed around physiotherapists "bridging neuroscience and technology." Copy speaks to clinic owners as peers and focuses on concrete outcomes such as range of motion, sessions, and capacity.
- **Logo assets:** `public/virtality_cyan.png` and `public/virtality_small_rounded.png`.
- **Hero video:** `public/hero/ManNeuralFlipped*.mp4` (with a poster image).

## Evidence on Hand

The user confirmed all of the following as real:

- **Pilot metrics** (`sections/benefits-grid/content.ts`, `sections/cta/content.ts`): 70–97% faster recovery compared with traditional therapy, 97% patient engagement sustained throughout treatment, and 2.5x efficiency (more patients per session).
- **Testimonials** (`sections/testimonials/content.ts`, in the constant `PLACEHOLDER_TESTIMONIALS`, a legacy name; the quotes are real) from clinicians and patients at Physio & Rehab PS, PhysioTherapy Clinic George Trantas, Physiotherapy Clinic Papoutsakis, and Kinisiotherapy. Dimitris is credited as an employee of the Trantas clinic, not its owner.
- **Press coverage** (`public/press/`, `sections/supported-by/content.ts`): Kathimerini, Anatolh, Bizrupt, Startupper, Beyond Expo, Delphi Economic Forum, Ionian, Ena Channel Kavala, HEC Paris, and Elculture.
- **Early-access program size:** taken from `WAITLIST_SOCIAL_PROOF_FLOOR` (`lib/waitlist-count`).
- **Mosaic section:** real clinic photos and clips.

Never invent new metrics, testimonials, clinic names, partners, certifications, or clinical claims, and don't extend or extrapolate the existing figures. Any new evidence must come from the team.

## Product Principles

1. **Outcomes lead.** Every section points back to movement recovered and progress made, not to VR novelty.
2. **Clinical credibility over hype.** Claims stay specific and backed by the evidence above. The tone is that of a trusted clinical tool, not a consumer gadget.
3. **Two clear next steps.** Trial and demo are always within reach, and neither crowds out the other.
4. **Proof is current.** Achievements, press, and news are part of the pitch. The blog and Supported by sections should feel alive, not archival.
