# Product

<!-- impeccable:product-schema 1 -->

Product record for the **Console** (`apps/console`), the clinician web app. The shared core for the whole platform is in the root `PRODUCT.md`. This file repeats the parts that matter here, because Impeccable loads only this file inside the app.

## Platform

web

## Users

- **Primary: clinicians at private physiotherapy clinics.** Clinic owners and lead physiotherapists who favor active recovery over passive symptom relief. They manage patients, author Reusable Programs, pair VR headsets, and run patient sessions.
- **Where they work:** planning and admin happen at a desk. During a session the clinician is in the treatment room, often guiding or treating the patient while the patient wears the headset.
- **Devices:** laptop or desktop first. Tablets are supported. Phone support is planned but not committed yet.
- **New clinics** arrive from the website to start the two-week free trial and go through sign-up, the Access Gate, and Getting Started.
- **Patients** never use the Console. Clinicians see their progress (reps, sets, session records) here.

## Product Purpose

The Console is where a clinic does its VR therapy work: it keeps the patient record, builds the exercise program, sends it to the headset, and records what the patient did. Success means a clinician can run a full session without stopping treatment to deal with the software, and can see each patient's progress across sessions at a glance.

## Positioning

Virtality's claim is neuro-driven movement: VR gets patients past pain fear and muscle compensation so they recover range of motion that had stalled. In the Console that claim shows up as control and evidence. The clinician prescribes precisely, changes exercises live, and sees measured reps and sets per session. It is a clinical instrument, not a game launcher.

## Operating Context

- The Console talks to paired headsets in real time over a Socket.IO bridge (`services/socket`). Headset state such as the confirmed current exercise and download progress arrives live and can lag or drop.
- **Core workflows:** Device Pairing, Quick Start (ad hoc sessions), building and editing Reusable Programs with Settings-First Authoring, running a session (Session Working Copy, live exercise changes), and the Session Completion Save Choice.
- **Also in scope:** Home Dashboard and Getting Started, patient profiles and the patient dashboard, Immersive Video (the Headset Library and downloads), clinical forms (pre- and post-treatment questionnaires), guides, devices, and access and billing (Access Gate, Entitlement, Stripe checkout, coupons).
- Vocabulary is defined in `apps/console/CONTEXT.md`. Use those terms in code and copy, and avoid the listed synonyms.
- Use the Simulated Headset (`docs/agents/headset-sim.md`) to check headset-facing features. The headset app itself isn't in this repo.

## Capabilities and Constraints

- Next.js 16, React 19, Tailwind 4. Shared primitives come from `@virtality/ui`.
- **Bilingual:** English and Greek (`apps/console/i18n`, fallback `en`). Keys live in the Translation Catalog (`packages/shared/src/translations/`). Greek drafts are approved in Adminboard (ADR 0010). Every string must fit and read well in both languages. Greek runs longer than English.
- **Feature flags:** billing UI (`NEXT_PUBLIC_BILLING_FEATURE_ENABLED`) and the VR Experiences nav entry (`NEXT_PUBLIC_VR_EXPERIENCES_NAV_ENABLED`).
- Live session edits change only the Session Working Copy. They never change a Reusable Program unless the clinician chooses that at the Session Completion Save Choice (ADR 0001).
- The Organization feature is deferred (ADR 0006). Programs and patients are clinician-scoped.
- **Open decision:** phone layouts. Laptop and tablet must work now. Phone is a direction, not a requirement yet.

## Brand Commitments

- **Name:** Virtality. **Tagline:** "Because every move matters."
- **Voice:** confident and clinical. In the Console that means plain, precise, and calm: name the action, the patient, and the exercise, with no marketing language inside the tool.
- Full brand record: root `PRODUCT.md`.

## Evidence on Hand

Patient data shown in the Console is the clinic's own. Don't add marketing metrics, testimonials, or clinical claims to Console surfaces. The confirmed marketing evidence lives in `apps/website/PRODUCT.md`, and the rule against inventing evidence in the root `PRODUCT.md` applies here too.

## Product Principles

1. **Works during treatment.** The Console is often used at a glance, with one hand, while the clinician attends to a patient. Session flows have to survive interruptions, partial attention, and a dropped headset connection.
2. **Clinician in control.** Clinicians own their programs and decide what changes. Nothing silently overwrites a Reusable Program.
3. **Progress is the point.** Patient screens lead with movement recovered and work done (reps, sets, sessions) rather than configuration.
4. **Truthful device state.** Show what the headset has actually confirmed, not what the Console asked for.
5. **Bilingual by default.** Greek is a first-class language, not an afterthought translation.
