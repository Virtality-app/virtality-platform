# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: clinicians at private physiotherapy clinics.** These are clinic owners and lead physiotherapists who favor active recovery over passive symptom relief. They use the **Console** (`apps/console`) to manage patients, author Reusable Programs, pair VR headsets, and run patient sessions. Planning and admin happen at a desk. During a session the clinician uses whatever device is nearby while the patient wears the headset.
- **Prospective clinics** evaluate Virtality on the public **website** (`apps/website`). From there they join the waitlist, book a 20-minute demo, or start the two-week free trial.
- **The internal Virtality team** uses **Adminboard** (`apps/adminboard`) to manage exercises, presets, maps, avatars, users, tester and access codes, marketing content (Highlight Cards, blog Posts), email, and the media bucket.
- **Patients** use the VR headset, not these web apps. Clinicians see patients' progress (reps, sets, session records) in the Console.

## Product Purpose

Virtality is an evidence-based VR therapy platform for physiotherapy clinics. Clinicians prescribe and run VR exercise sessions that help patients regain movement faster, stay engaged with their treatment, and free up therapist time. Success means patients reach range-of-motion and functional goals sooner, clinics treat more patients without adding staff, and clinicians trust the platform enough to make it part of routine care.

## Positioning

Virtality's core claim is neuro-driven movement. The VR environment gets patients past pain fear and muscle compensation, so they move more fully and naturally than in standard exercise. That retrains movement and recovers range of motion that had stalled: in pilot cases, shoulders that hadn't progressed for months reached full range within two or three sessions. A generic VR exercise product can't truthfully make this claim. Clinic capacity and clinician control support it but don't lead.

## Operating Context

- Sessions take place in clinic treatment rooms. The Console talks to paired headsets in real time over a Socket.IO bridge (`services/socket`). The clinician may be guiding or treating the patient while operating the Console.
- Core Console workflows: Device Pairing, Quick Start (ad hoc sessions), building and editing Reusable Programs with Settings-First Authoring, running a session (Session Working Copy, live exercise changes), and the Session Completion Save Choice. The Console also covers the Home Dashboard, Immersive Video (the Headset Library and downloads), and access and billing (Access Gate, Entitlement, Stripe checkout, coupons).
- Domain vocabulary is defined in `CONTEXT-MAP.md` and each app's `CONTEXT.md`. Use those terms and avoid the listed synonyms.

## Capabilities and Constraints

- Monorepo built with pnpm and Turborepo. All three apps run Next.js 16 (with breaking changes from earlier versions), React 19, and Tailwind 4. Shared UI primitives live in `packages/ui` (`@virtality/ui`; see `packages/ui/CONTRACT.md`).
- **Market:** Greek private clinics first. The Console ships in English and Greek (`apps/console/i18n`, fallback `en`), so every Console string needs to work in both languages. The website is English-only for now and also aims for international reach.
- The headset app itself isn't in this repo. Use the Simulated Headset (`docs/agents/headset-sim.md`) to check headset-facing Console features.
- Features gated behind flags: billing UI (`NEXT_PUBLIC_BILLING_FEATURE_ENABLED`) and the VR Experiences nav entry (`NEXT_PUBLIC_VR_EXPERIENCES_NAV_ENABLED`).
- The Organization feature is deferred (ADR 0006).

## Brand Commitments

- **Name:** Virtality. **Tagline:** "Because every move matters."
- **Voice:** confident, clinical, and outcome-focused, framed around physiotherapists "bridging neuroscience and technology." The copy speaks to clinic owners as peers and focuses on concrete outcomes such as range of motion, sessions, and capacity.
- **Logo assets:** `apps/website/public/virtality_cyan.png` and `apps/website/public/virtality_small_rounded.png`.
- **Hero video:** `apps/website/public/hero/ManNeuralFlipped*.mp4` (with a poster image).

## Evidence on Hand

The user confirmed all of the following as real:

- **Pilot metrics** (`apps/website/sections/benefits-grid/content.ts`, `sections/cta/content.ts`): 70–97% faster recovery compared with traditional therapy, 97% patient engagement sustained throughout treatment, and 2.5x efficiency (more patients per session).
- **Testimonials** (`apps/website/sections/testimonials/content.ts`, in the constant `PLACEHOLDER_TESTIMONIALS`, a legacy name; the quotes are real) from clinicians and patients at Physio & Rehab PS, PhysioTherapy Clinic George Trantas, Physiotherapy Clinic Papoutsakis, and Kinisiotherapy. Dimitris is credited as an employee of the Trantas clinic, not its owner.
- **Press coverage** (`apps/website/public/press/`, `sections/supported-by/content.ts`): Kathimerini, Anatolh, Bizrupt, Startupper, Beyond Expo, Delphi Economic Forum, Ionian, Ena Channel Kavala, HEC Paris, and Elculture.
- **Early-access program size:** taken from `WAITLIST_SOCIAL_PROOF_FLOOR` (`apps/website/lib/waitlist-count`).
- **Mosaic section:** real clinic photos and clips.

Never invent new metrics, testimonials, clinic names, partners, certifications, or clinical claims, and don't extend or extrapolate the existing figures. Any new evidence must come from the team.

## Product Principles

1. **Outcomes lead.** Every surface should point back to movement recovered and progress made, not to VR novelty.
2. **Clinician in control.** Clinicians own their programs and decide what changes. Live session edits never silently overwrite a Reusable Program.
3. **Works during treatment.** The Console is often used with one hand, at a glance, while the clinician attends to a patient. Session flows have to survive interruptions and partial attention.
4. **Clinical credibility over hype.** Claims stay specific and backed by real evidence. The tone is that of a trusted clinical tool, not a consumer gadget.
5. **Bilingual by default.** Greek is a first-class language in the Console, not an afterthought translation.
