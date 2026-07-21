# Website

Public marketing site — landing, pricing, blog, case studies, waitlist, and contact.

## Section layout

Landing and marketing UI is organized by **section** (feature), not by technical layer. A section owns its UI, copy, and section-private helpers.

```
sections/<section>/
  index.ts              # public API — re-export what pages may import
  content.ts            # section copy / static content (at section root)
  <section>.tsx         # OK when there is only one UI file
  components/           # when there are 2+ UI files
  lib/                  # when there are 2+ helpers; colocated *.test.ts
```

### Rules

1. **Section is the unit of change.** Editing benefits copy or UI means opening `sections/benefits/` only.
2. **Nest by kind when crowded.** One file of a kind stays at the section root. Two or more of the same kind go in `components/` or `lib/`.
3. **Tests live with `lib/`.** Colocate `*.test.ts` next to the helper under test (not a separate `tests/` folder).
4. **`index.ts` is the public API.** Pages import from `@/sections/<section>`. Internal `components/` and `lib/` stay private to the section.
5. **Routes compose only.** `app/**/page.tsx` assembles sections; it does not own section markup or copy.
6. **Shared across sections** → `components/shared/` (or app-wide `lib/` for non-UI helpers). Do not reach into another section’s internals except via that section’s `index.ts` when a deliberate public export exists. Example: `WaitlistForm` is exported from `sections/cta` for the waitlist page.
7. **App-wide concerns stay outside `sections/`:** `components/layout/`, `components/ui/`, `lib/` (actions, utils, demo booking, legal, waitlist), `data/` for cross-page catalogs (e.g. pricing plans).

### Current landing sections

| Section        | Path                     |
| -------------- | ------------------------ |
| Hero           | `sections/hero/`         |
| Benefits       | `sections/benefits/`     |
| Features       | `sections/features/`     |
| Testimonials   | `sections/testimonials/` |
| Mosaic         | `sections/mosaic/`       |
| Promo video    | `sections/promo-video/`  |
| Supported by   | `sections/supported-by/` |
| Call to action | `sections/cta/`          |

### Adding a section

1. Create `sections/<name>/` with `index.ts` and `content.ts` (if there is copy).
2. Add UI at the root or under `components/` per the nesting rule.
3. Wire the section into the relevant `app/**/page.tsx`.
