# Research: Lucide icon loading and missing-icon behavior (Highlight Cards)

**Ticket:** [Research Lucide icon loading and missing-icon behavior on the website](https://github.com/Steliospne/virtality-platform/issues/167)  
**Map:** [Highlight Card managing tool — way to agent handoff spec](https://github.com/Steliospne/virtality-platform/issues/165)  
**Date:** 2026-07-21  
**Scope:** How `apps/website` loads Lucide icons for Highlight Cards today (via shared `FeatureCard`), and what happens on a missing or invalid icon name.

**Agreed product fallback (map, locked):** Invalid Lucide name → card still renders; icon well keeps its background color, no glyph.

---

## Verdict

Today both Benefits and Features Highlight Card grids render through one shared client component, `FeatureCard`, which dynamically imports the entire `lucide-react` package and indexes it by string name. There is **no runtime guard** for invalid names. Missing/`undefined` icon props already match the agreed empty-well fallback. **Invalid names do not:** they put an invalid React element into state and **crash the card on render** with React’s “Element type is invalid … got: undefined” error. Handoff should treat picker validation plus an explicit `mod[name]` existence check (or equivalent) as required to meet the locked fallback — current website code does not implement it.

---

## Primary sources

| Source                                                        | Role                                                     |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/website/components/shared/feature-card.tsx`             | Shared Highlight Card UI + Lucide load path              |
| `apps/website/sections/benefits/components/benefits-grid.tsx` | Benefits → `FeatureCard`                                 |
| `apps/website/sections/features/features.tsx`                 | Features → `FeatureCard`                                 |
| `apps/website/sections/benefits/content.ts`                   | Benefits icon name union + seed data                     |
| `apps/website/sections/features/content.ts`                   | Features icon typing + seed data                         |
| `apps/website/package.json`                                   | `lucide-react` `0.511.0`                                 |
| `apps/website/sections/cta/components/call-to-action.tsx`     | Contrast: static Lucide import map (not Highlight Cards) |
| Installed `lucide-react@0.511.0` (via `apps/website`)         | Export shape / aliases / missing-name resolution         |

---

## How icons load today

### Shared path: `FeatureCard`

Both landing grids use the same component:

- Benefits: `benefits-grid.tsx` maps `LANDING_BENEFITS` → `<FeatureCard title ctx icon index />`.
- Features: `features.tsx` maps `features` → `<FeatureCard title ctx icon index />`.

`FeatureCard` is a client component (`'use client'`). Icon prop type:

```ts
icon?: keyof typeof import('lucide-react')
```

Load behavior (`feature-card.tsx`):

1. State starts as `importedComponent = null`.
2. `useEffect` runs when `icon` changes.
3. If `!icon`, the effect returns immediately (no import).
4. Otherwise it calls `import('lucide-react')` (full package, template-literal form with a fixed specifier — not Lucide’s per-icon `dynamicIconImports`).
5. On resolve: `const IconComponent = mod[icon] as FC` then `setImportedComponent(<IconComponent />)`.
6. There is **no** `.catch()`, **no** `if (!IconComponent)` check, and **no** filtering of non-icon exports.

Icon well markup (always present regardless of glyph):

```tsx
<div className='mb-5 flex size-14 items-center justify-center rounded-xl bg-linear-to-br from-vital-blue-700 to-vital-blue-600 …'>
  <div className='*:size-6 text-white'>{importedComponent}</div>
</div>
```

So the well’s background is structural CSS on the outer div; the glyph is only whatever lands in `importedComponent`.

### Content typing differs by section

**Benefits** (`benefits/content.ts`): curated string union `LandingBenefitIconName` (`PersonStanding`, `Shield`, `Users`, `Sparkles`, `ClipboardList`, `Building2`) and every seed card sets `icon`. Compile-time allowlist only — not enforced at runtime in `FeatureCard`.

**Features** (`features/content.ts`): `icon?: keyof typeof import('lucide-react')` — optional, and the key space is the whole module (icons **plus** non-icon exports such as `icons`, `Icon`, `createLucideIcon`). Seed data currently sets icons: `Activity`, `Brain`, `Package`, `BarChartBig`, `Sliders`, `Clock`.

### Other Lucide patterns on the website (not Highlight Cards)

Most other usages are **static named imports** (e.g. hero, waitlist, mobile nav). CTA trust points use a small compile-time map `Record<CtaTrustPointIconName, LucideIcon>` — a closed allowlist, not dynamic string lookup. The only dynamic Lucide-by-name path found under `apps/website` is `FeatureCard`.

### Package facts (verified against installed `lucide-react@0.511.0`)

- Website depends on `"lucide-react": "0.511.0"`.
- Current seed names all resolve to components (including aliases: `BarChartBig` → same component as `ChartColumnBig`; `Sliders` → same as `SlidersVertical`).
- `lucide['NotARealIcon']` is `undefined`.
- Module also exports non-glyph values (`icons` map ~1594 entries, `Icon`, `createLucideIcon`) that type-check under `keyof typeof import('lucide-react')` but are not usable as icon components in this path.

---

## Failure modes vs agreed fallback

| Input                                                                            | Current behavior                                                                                                                                                                                                                                                                                                   | Matches agreed fallback?                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `icon` omitted / `undefined` / falsy                                             | Effect no-ops; `importedComponent` stays `null`; card + well background render; no glyph                                                                                                                                                                                                                           | **Yes**                                      |
| Valid Lucide icon name (incl. aliases like `BarChartBig`)                        | Full `lucide-react` import; glyph rendered inside well                                                                                                                                                                                                                                                             | N/A (happy path)                             |
| Invalid / unknown string name                                                    | `mod[icon]` is `undefined`; code still does `setImportedComponent(<IconComponent />)`. `React.createElement(undefined)` does **not** throw at create time, but **rendering** that element throws: `Element type is invalid: … got: undefined`. Card render fails (React error); no intentional empty-well fallback | **No**                                       |
| Name that exists but is not an icon component (e.g. `icons`, `createLucideIcon`) | Same unsafe cast/render path; render failure (wrong element type)                                                                                                                                                                                                                                                  | **No**                                       |
| Import promise rejection                                                         | No `.catch()`; unhandled rejection; state stays `null` until/unless error surfaces                                                                                                                                                                                                                                 | Accidental empty well, not designed fallback |

### Gap for the handoff

Locked product rule: **invalid Lucide name → card still renders; icon well keeps background; no glyph.**

Today that is true only for a missing prop. For an invalid persisted name (exactly what a searchable Lucide picker without an allowlist can produce), the website will **error on render** rather than degrade to an empty well. Spec should require:

1. **Adminboard / API:** picker validation (and preferably persist only names that resolve in the chosen Lucide version).
2. **Website `FeatureCard` (or successor Highlight Card component):** runtime check that `mod[name]` is a renderable component before `setImportedComponent`; otherwise leave glyph empty — so the locked fallback holds even if bad data slips through.

Renaming `FeatureCard` → Highlight Card naming is already on the map; the load/fallback fix belongs in that shared component.

---

## Implications for picker validation

- Type-level `keyof typeof import('lucide-react')` is **not** a safe allowlist of icon glyph names (includes utilities / maps).
- Benefits’ curated union is a seed-era allowlist; the map already locks **no curated allowlist** for the picker — validation must be “exists as a Lucide icon component in the website’s Lucide version,” not “in a hand-maintained shortlist.”
- Alias names (`BarChartBig`, `Sliders`, …) are valid today against `0.511.0`; handoff should note version pinning so Adminboard preview and website resolve the same set.
- Empty collection → hide grid is a separate map rule; unrelated to icon fallback, but both touch the same sections.

---

## Sources not used

No secondary blog posts or third-party Lucide tutorials — behavior was read from this repo’s components/content and the installed `lucide-react` package.
