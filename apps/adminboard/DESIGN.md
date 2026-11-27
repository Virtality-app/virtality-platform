---
name: Virtality Adminboard
description: The control room behind the Console and the website.
colors:
  control-blue: '#1467c2'
  control-blue-night: '#73b1ff'
  signal-blue: 'oklch(0.6 0.17 255)'
  ink: 'oklch(0.17 0.015 255)'
  graphite: 'oklch(0.21 0.006 285.885)'
  slate-muted: 'oklch(0.54 0.02 255)'
  hairline: 'oklch(0.92 0.008 255)'
  frost: 'oklch(0.97 0.004 255)'
  rail: 'oklch(0.985 0.004 255)'
  surface: 'oklch(0.99 0.004 255)'
  card: 'oklch(0.995 0.003 255)'
  alert-red: 'oklch(0.637 0.237 25.331)'
  chart-cyan: 'oklch(0.62 0.14 195)'
  chart-green: 'oklch(0.64 0.16 155)'
  chart-amber: 'oklch(0.72 0.14 85)'
  chart-violet: 'oklch(0.6 0.16 310)'
typography:
  headline:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: '-0.025em'
  body:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.33
  group-label:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '11px'
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: '0.05em'
  metric:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.025em'
    fontFeature: 'tnum'
  code:
    fontFamily: 'Geist Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.33
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '14px'
  full: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.control-blue}'
    textColor: '{colors.card}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-primary-hover:
    backgroundColor: '#1467c2e6'
  button-default:
    backgroundColor: '{colors.graphite}'
    textColor: '{colors.card}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-outline:
    backgroundColor: '{colors.card}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-destructive:
    backgroundColor: '{colors.alert-red}'
    textColor: '{colors.card}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  input:
    backgroundColor: '{colors.card}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '4px 12px'
    height: '36px'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    padding: '24px'
  filter-chip:
    backgroundColor: '{colors.card}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '4px 8px'
  segmented-control:
    backgroundColor: '{colors.frost}'
    textColor: '{colors.slate-muted}'
    rounded: '{rounded.lg}'
    height: '36px'
  sidebar-item:
    backgroundColor: '{colors.rail}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    height: '32px'
  sidebar-item-active:
    backgroundColor: '{colors.frost}'
    textColor: '{colors.graphite}'
---

# Design System: Virtality Adminboard

## Overview

**Creative North Star: "The Control Room"**

Adminboard is where the Virtality team pulls the levers that reach clinicians, prospects and inboxes. Every lever is in view and labelled with what it affects. The room stays calm until something needs a deliberate hand. The surface is cool and quiet: near-white grounds tinted toward blue (hue 255), hairline borders, and Geist at working sizes. Colour reports state or marks creation. It never decorates.

The mood is precise, operational and unflashy. Pages open with a plain heading and one-line description, then go straight to the work: a table, a form, a set of charts. Controls are labelled and deliberate. Each says what it will change. Creating something is Control Blue, and an action that can't be undone is red and takes a clear second step.

Density sits between compact and comfortable. Tables run at Body size with 8px cell padding, and dashboards use generous card gutters so numbers can be compared at a glance.

**Key Characteristics:**

- Cool, blue-tinted neutrals; one Control Blue for create and commit actions.
- Hairline-bordered tables and cards; soft lift only.
- Small uppercase group labels organise a long sidebar.
- Geist Mono for codes, keys and identifiers.
- Charts share one theme: a muted axis, dashed grid, and a fixed five-colour series.
- Light and dark themes, following the system setting by default.

## Colors

A cool blue-grey neutral palette, one Control Blue action colour, a separate Signal Blue for focus and data, and red for anything destructive.

### Primary

- **Control Blue** (control-blue): the create and commit action, as in Create, Add headset and Attach headset. Near-white text on it (about 5.4:1). In dark mode the button flips to **Control Blue Night** (control-blue-night) with zinc-900 text (about 8:1).
- **Signal Blue** (signal-blue): focus rings, the sidebar ring and the first chart series. It shares Control Blue's hue, so focus, data and action read as one family.

### Secondary (chart series)

- **Chart Cyan** (chart-cyan), **Chart Green** (chart-green), **Chart Amber** (chart-amber) and **Chart Violet** (chart-violet) complete the five-series set after Signal Blue. Exercise sessions are Signal Blue and VR video sessions are Chart Amber. Per-clinician series cycle through all five in order.

### Neutral

- **Ink** (ink): primary text.
- **Graphite** (graphite): the default button (for example Columns). A strong action that isn't a creation.
- **Slate Muted** (slate-muted): descriptions, table meta and axis ticks.
- **Hairline** (hairline): borders, input strokes and table row rules.
- **Frost** (frost): segmented-control rails, hover fills, secondary buttons and the active sidebar item.
- **Rail** (rail): the sidebar surface.
- **Surface** (surface): the page background.
- **Card** (card): cards, popovers and table bodies.

### Status

- **Alert Red** (alert-red, Tailwind `red-500`): destructive buttons, validation text and failed states.
- **Amber** (Tailwind `amber-300`–`amber-950`): warnings and pending states, as soft banners with an amber border.
- **Emerald** (Tailwind `emerald-500`/`emerald-700`): success confirmations.

### Named Rules

**The Blue Means Create Rule.** Control Blue goes on the action that makes or commits something. A toolbar has at most one. Utility actions such as Columns, filters and export use Graphite or Outline.

**The Colour Reports State Rule.** Red, amber and emerald appear only for a real state (failed, pending, done). Chart colours appear only inside charts and their legends.

## Typography

**Body Font:** Geist (with ui-sans-serif, system-ui)
**Mono Font:** Geist Mono, for codes, object keys, Video IDs and device identifiers

**Character:** One working grotesque with slightly tightened headings. Mono appears only where a value must be copied or compared character by character.

### Hierarchy

- **Headline** (600, 1.5rem, tracking -0.025em): page titles ("Dashboard", "Headset inventory").
- **Title** (600, 1.125rem, tracking -0.025em): the top-bar "Adminboard" wordmark, card titles and dialog titles.
- **Body** (400, 0.875rem): table cells, form fields, descriptions and buttons.
- **Label** (500, 0.75rem): filter chips, badges, legends and stat captions.
- **Group Label** (600, 11px, uppercase, tracking 0.05em): sidebar section headings only (Overview, Content, Resources, Billing, Admin).
- **Metric** (600, 1.875rem, tracking -0.025em, tabular figures): dashboard and report stat values.
- **Code** (Geist Mono, 0.75rem): identifiers.

### Named Rules

**The Mono Means Exact Rule.** Use Geist Mono only for values someone copies, pastes or matches, such as codes, keys and IDs. Never use it to make a screen look technical.

## Layout

The shell is a collapsible left sidebar of grouped, collapsible sections with uppercase Group Labels and a hairline guide line beside nested items, plus a sticky 60px top bar (`h-15`) with the "Adminboard" title and the account menu. The `--spacing-screen-with-header` token subtracts the bar from the viewport.

Pages sit in a padded content area (about 24–32px). A page header puts the Headline and a one-line Slate Muted description on the left, with the page's primary action or a related link on the right. Below it come filters (a search field, segmented controls, a date-range button and chip filters), then the content. Data pages are one full-width table. Dashboards use a four-column stat row over a 2:1 chart and breakdown grid, collapsing to fewer columns on narrower screens. Desk-only use: laptop and desktop are the targets.

Breakpoints are Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).

### Named Rules

**The Header Says What Changes Rule.** Every page header's description states what the page controls and who it reaches. For example: "Paired headsets waiting for an Access Code. Use Move to code to send one to a customer."

## Elevation & Depth

Depth comes from hairline borders first and a soft lift second. Tables and cards sit on the Surface with a hairline border, and stat cards add a small ambient shadow. Overlays (dialogs, popovers, menus, toasts) float with larger shadows over a dimmed page. Chart tooltips use a 12px radius and a soft, foreground-tinted shadow.

### Shadow Vocabulary

- **Hairline lift** (`shadow-xs`): buttons and inputs.
- **Card lift** (`shadow-sm`): stat and chart cards.
- **Overlay** (`shadow-md` on menus and popovers, `shadow-lg` on dialogs and toasts).
- **Chart tooltip** (`0 10px 10px` foreground at 10%): Recharts tooltips only.

### Named Rules

**The Border Carries It Rule.** Every container has a hairline border. Shadows only soften it, and tables have none.

## Shapes

The shapes are gently rounded on a 10px base radius. Buttons, inputs, selects and sidebar items use 8px. Segmented-control rails use 10px, with 8px active chips. Cards, tables and chart panels use 14px. Filter chips, avatars and legend dots are fully round. Dashed 14px borders mark empty states and drop zones.

## Components

Labelled and deliberate: every control says what it affects, and risky actions take a clear extra step.

### Buttons

- **Shape:** 8px corners, 36px default height (`sm` 32px, `lg` 40px), 16px icons, with icon and label 8px apart.
- **Primary (Control Blue):** create and commit actions, with near-white text and a hairline shadow. Hover drops to 90% opacity.
- **Default (Graphite):** strong utility actions (Columns).
- **Outline:** secondary and navigational actions (Next, Previous, "Adoption & Engagement").
- **Secondary / Ghost:** Frost fill or none, for toolbar and row actions.
- **Destructive:** solid Alert Red, used inside the confirmation step of a destructive action.
- **Focus:** a 3px ring in zinc-950 at 50% (zinc-300 in dark mode) plus a border shift.

### Tables (signature)

The shared data table is a 14px-cornered hairline box with no outer shadow. It has a header row of sortable column labels with up/down chevrons, Body-size rows separated by hairline rules, a leading checkbox and row index, and identifiers in mono where they are copied. Below it sit the selection count, a rows-per-page select and Outline Previous/Next buttons. A search field, a Columns button and status filter chips sit above.

### Filter Chips

These are fully round, with a hairline border, Label typography and 4px × 8px padding, used for status filters (Unused, Expired, Redeemed, Already entitled). Selected chips fill with Frost.

### Segmented Controls

A Frost rail with 10px corners holds Body-size options in Slate Muted. The active option is a Card-coloured chip with a hairline lift. They are used for dashboard tabs, ranges and granularity (Overview / Sessions / Clinicians, 7 days … All time, Daily / Weekly).

### Cards / Containers

- **Corner style:** 14px.
- **Background:** Card on Surface.
- **Shadow strategy:** Card lift on stat and chart cards. Tables have none.
- **Border:** Hairline, always.
- **Internal padding:** 24px.
- **Stat cards:** a Body-size caption in Slate Muted, the value at Metric size, then a thin progress bar or split in the series colour and a Label-size breakdown.
- **Report stat cards** (Adoption & Engagement): add a 4px tone-coloured strip on the left edge and a faint diagonal tone wash.

### Inputs / Fields

- **Style:** 36px tall, 8px corners, hairline stroke, Body text, and Slate Muted placeholder.
- **Focus:** 3px ring at 50% plus a border shift.
- **Error:** Alert Red border and ring, with the message in red below the field.

### Notices

These are full-width rounded panels with a hairline border, a Frost fill, a 16px info icon and Body text in Slate Muted. Warnings use the amber border and tint.

### Navigation

- **Sidebar:** a Rail surface. Collapsible groups have Group Labels and a rotating chevron. Items use 16px text with 16px icons, 32px rows and 8px corners. Active and hover items fill with Frost. Nested items sit beside a hairline guide line.
- **Top bar:** a Surface background with a hairline bottom border, the sidebar toggle, the Title-size "Adminboard" wordmark and the account avatar on the right.

### Toasts

Toasts (Sonner) appear bottom-right on a Card surface with a hairline border and Overlay shadow. The message states the outcome in the product's own terms: "Headset-01 moved to GO-NEWGC8RZ00 as Headset-03".

## Do's and Don'ts

### Do:

- **Do** reserve Control Blue (#1467c2) for the one create or commit action in a toolbar or dialog.
- **Do** open every page with a Headline and a one-line description of what the page controls.
- **Do** set codes, object keys, Video IDs and device identifiers in Geist Mono.
- **Do** put a hairline border on every table and card, then add the soft lift on cards only.
- **Do** use the shared chart theme (`components/dashboard/chart-theme.ts`) and the fixed series order for every chart.
- **Do** make irreversible actions (Final Send, Enable in Console, publishing an Addressables Catalog) red and behind an explicit confirmation step.
- **Do** write toast and confirmation copy that names the object and the outcome.

### Don't:

- **Don't** use gold or yellow for primary actions. Control Blue replaced it because white text on gold failed contrast.
- **Don't** put more than one Control Blue button in the same toolbar or dialog.
- **Don't** use red, amber or emerald for decoration. They report state only.
- **Don't** use chart colours outside charts and their legends.
- **Don't** use Geist Mono for headings, labels or numbers that aren't identifiers.
