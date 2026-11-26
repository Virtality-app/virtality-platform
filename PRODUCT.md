# Product

<!-- impeccable:product-schema 1 -->

This is the shared product core for the whole Virtality platform. Each app has its own record, and Impeccable loads that file in place of this one when it works inside the app:

| App        | Product record               |
| ---------- | ---------------------------- |
| Console    | `apps/console/PRODUCT.md`    |
| Adminboard | `apps/adminboard/PRODUCT.md` |
| Website    | `apps/website/PRODUCT.md`    |

This file still applies directly to the shared workspaces (`packages/ui`, `packages/react-query`). If a fact holds for every app, put it here and repeat the short version in each app file. If it holds for one app, put it only in that app's file.

## Platform

web

## Users

- **Clinicians at private physiotherapy clinics.** Clinic owners and lead physiotherapists who favor active recovery over passive symptom relief. They work in the Console.
- **Prospective clinics.** They evaluate Virtality on the public website.
- **The internal Virtality team.** Founders and leadership, engineering and ops, and marketing and content. They work in Adminboard.
- **Patients.** They use the VR headset, not the web apps. The headset app isn't in this repo.

## Product Purpose

Virtality is an evidence-based VR therapy platform for physiotherapy clinics. Clinicians prescribe and run VR exercise sessions that help patients regain movement faster, stay engaged with their treatment, and free up therapist time. Success means patients reach range-of-motion and functional goals sooner, clinics treat more patients without adding staff, and clinicians trust the platform enough to make it part of routine care.

## Positioning

Virtality's core claim is neuro-driven movement. The VR environment gets patients past pain fear and muscle compensation, so they move more fully and naturally than in standard exercise. That retrains movement and recovers range of motion that had stalled: in pilot cases, shoulders that hadn't progressed for months reached full range within two or three sessions. A generic VR exercise product can't truthfully make this claim. Clinic capacity and clinician control support it but don't lead.

## Capabilities and Constraints

- Monorepo built with pnpm and Turborepo. All three apps run Next.js 16 (with breaking changes from earlier versions), React 19, and Tailwind 4. Shared UI primitives live in `packages/ui` (`@virtality/ui`; see `packages/ui/CONTEXT.md`).
- **Market:** Greek private clinics first, with international reach as a goal.
- Domain vocabulary lives in `CONTEXT-MAP.md` and each app's `CONTEXT.md`. Use those terms and avoid the listed synonyms.
- The Organization feature is deferred (ADR 0006).

## Brand Commitments

- **Name:** Virtality. **Tagline:** "Because every move matters."
- **Voice:** confident, clinical, and outcome-focused, framed around physiotherapists "bridging neuroscience and technology." Copy speaks to clinic owners as peers and focuses on concrete outcomes such as range of motion, sessions, and capacity.
- **Logo assets:** `apps/website/public/virtality_cyan.png` and `apps/website/public/virtality_small_rounded.png`.

## Evidence on Hand

The confirmed evidence (pilot metrics, testimonials, press, clinic photos) is listed with file paths in `apps/website/PRODUCT.md`.

Never invent new metrics, testimonials, clinic names, partners, certifications, or clinical claims, and don't extend or extrapolate the existing figures. Any new evidence must come from the team.

## Product Principles

1. **Outcomes lead.** Every surface should point back to movement recovered and progress made, not to VR novelty.
2. **Clinician in control.** Clinicians own their programs and decide what changes.
3. **Clinical credibility over hype.** Claims stay specific and backed by real evidence. The tone is that of a trusted clinical tool, not a consumer gadget.
4. **Bilingual by default.** Greek is a first-class language wherever clinicians read the product, not an afterthought translation.
