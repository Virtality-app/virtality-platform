---
name: Virtality Console
description: The clinician's instrument for running VR therapy sessions in the treatment room.
colors:
  vital-teal: '#08899a'
  vital-teal-deep: '#06626e'
  vital-teal-bright: '#0ab1c6'
  vital-teal-mist: '#bdf4fc'
  vital-teal-wash: '#e9fbfe'
  ink: 'oklch(0.141 0.005 285.823)'
  graphite: 'oklch(0.21 0.006 285.885)'
  slate-muted: 'oklch(0.552 0.016 285.938)'
  hairline: 'oklch(0.92 0.004 286.32)'
  mist: 'oklch(0.967 0.001 286.375)'
  rail: 'oklch(0.985 0 0)'
  paper: 'oklch(1 0 0)'
  clinical-red: 'oklch(0.577 0.245 27.325)'
  progress-green-deep: 'hsl(160 95% 30%)'
  progress-green: 'hsl(150 90% 45%)'
  progress-green-light: 'hsl(165 85% 55%)'
typography:
  display:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.33
  title:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 600
    lineHeight: 1
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
  metric:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1
    fontFeature: 'tnum'
  code:
    fontFamily: 'Geist Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 500
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
    backgroundColor: '{colors.vital-teal}'
    textColor: '{colors.paper}'
    typography: '{typography.title}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-primary-hover:
    backgroundColor: '#08899ae6'
  button-default:
    backgroundColor: '{colors.graphite}'
    textColor: '{colors.paper}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-outline:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-outline-hover:
    backgroundColor: '{colors.mist}'
  button-transport:
    backgroundColor: '{colors.vital-teal}'
    textColor: '{colors.paper}'
    rounded: '{rounded.md}'
    height: '56px'
  button-end-session:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.clinical-red}'
    rounded: '{rounded.md}'
    height: '56px'
  input:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '4px 12px'
    height: '36px'
  card:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    padding: '24px'
  badge:
    backgroundColor: '{colors.mist}'
    textColor: '{colors.graphite}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '2px 8px'
  sidebar-item:
    backgroundColor: '{colors.rail}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    height: '32px'
  sidebar-item-active:
    backgroundColor: '{colors.mist}'
    textColor: '{colors.graphite}'
---

# Design System: Virtality Console

## Overview

**Creative North Star: "The Treatment Room Instrument"**

The Console is a calm, precise tool that a clinician glances at while their hands are on a patient. The chrome stays quiet: zinc neutrals, white cards, hairline borders. Colour appears only where it means something. Vital Teal marks the action to take, green marks progress and a live session, and red marks ending or deleting. A screen should be readable in one look from arm's length, and its main action should be hittable without searching.

The mood is calm, precise and clinical. Numbers are exact and set in tabular figures. Labels say what a control does. Nothing is there for decoration. Density is moderate. Planning screens (programs, patient profiles) can hold forms and lists. Session screens give the current exercise, set and rep counters and the transport controls most of the space.

The Console must never look like a consumer fitness app (streaks, confetti, gamified badges, motivational gradients), like gaming or VR neon (dark glows, sci-fi HUD styling), or like a legacy hospital EHR (grey form walls, cramped tables, tiny controls).

**Key Characteristics:**

- Neutral zinc shell, with Vital Teal reserved for actions.
- White cards with a hairline border and a soft lift.
- Geist Sans throughout, with tabular figures for every count.
- Large, unmistakable controls where a session is running.
- Light and dark themes, following the system setting by default.

## Colors

A cool zinc neutral palette carries the interface, with one teal action colour and a small set of status colours.

### Primary

- **Vital Teal** (vital-teal): the action colour. Primary buttons (Pause/Resume, Save, Subscribe), the active tab in the patient sub-nav, focus on brand links, and the underline on hover links. In dark mode the primary button flips to Vital Teal Mist with dark text.
- **Vital Teal Deep** (vital-teal-deep): borders and text on teal-tinted surfaces where Vital Teal would lack contrast.
- **Vital Teal Bright** (vital-teal-bright): text selection highlight only.
- **Vital Teal Mist** (vital-teal-mist) and **Vital Teal Wash** (vital-teal-wash): tinted backgrounds for teal callouts and the dark-mode primary button.

### Secondary

- **Progress Green** ramp (progress-green-deep, progress-green, progress-green-light): rep and set charts, one shade per set. Emerald borders (`emerald-500` at 40%) mark a started session, and green dots mark "in session" and "connected".

### Neutral

- **Ink** (ink): body text and headings in light mode, and the dark-mode page background.
- **Graphite** (graphite): the default (non-teal) button and badge text. Secondary emphasis.
- **Slate Muted** (slate-muted): descriptions, captions, placeholder text and units ("of 3", "Sessions").
- **Hairline** (hairline): every border and input stroke.
- **Mist** (mist): secondary and ghost hover fills, tab rails, icon tiles and badges.
- **Rail** (rail): the sidebar surface.
- **Paper** (paper): page and card surface.

### Status

- **Clinical Red** (clinical-red): destructive buttons, End session, Delete, and validation errors. Use red text with a red/40 border on a paper fill. Solid red fills are reserved for the final confirm in a destructive dialog.
- **Amber** (Tailwind `amber-300`–`amber-950`): warnings, renew and expiry banners, and the "Unsaved changes" dot.

### Named Rules

**The Teal Means Act Rule.** Vital Teal goes on the thing to press next, and nowhere decorative. If a screen has two teal buttons, one of them is wrong.

**The Status Is Earned Rule.** Green, amber and red appear only when they report a real state: headset connected, session live, something unsaved or expiring, something destructive. They are never used for decoration or category coding.

## Typography

**Body Font:** Geist (with ui-sans-serif, system-ui)
**Mono Font:** Geist Mono, for codes only (promo codes, pairing codes, identifiers)

**Character:** One neutral grotesque used for everything. Hierarchy comes from size and weight, not from a second family. Geist's tabular figures keep counters from jittering as reps tick up.

### Hierarchy

- **Display** (700, 1.875rem, scaling to 2.25rem at `md`): page-level greetings and full-screen moments such as the home header, trial welcome and checkout success.
- **Headline** (600, 1.5rem, rising to 1.875rem at `sm`): the current exercise name in a running session, and section headings.
- **Title** (600, 1rem, line-height 1): card titles and form-section headers.
- **Body** (400, 0.875rem): the working size for nearly all UI text, including table cells, form fields, list rows and descriptions.
- **Label** (500, 0.75rem): badges, captions, chart ticks and stat labels ("Sessions", "Last visit").
- **Metric** (600, 1.875rem, tabular figures): set and rep counters, session counts and dates in stat blocks. Pair it with a Label-size unit in Slate Muted ("of 6").

The `text-h1`–`text-h4` utilities in `app/typography.css` (40, 32, 24 and 20px) exist but are rarely used. Prefer the hierarchy above.

### Named Rules

**The Tabular Count Rule.** Every number that changes during a session (rep, set, exercise index, timer) uses tabular figures, so the layout never shifts as it counts.

**The Two-Language Fit Rule.** Every label is set to survive Greek, which runs longer than English. Let text wrap (`text-balance` on headings), and never truncate a button label to fit.

## Layout

The app shell is a collapsible left sidebar (it collapses to icons) plus a sticky 60px top bar (`h-15`) that is frosted (`zinc-200/80`, slight backdrop blur). Patient screens add a second bar with the Patient Dashboard and Profile tabs and a centred "Viewing: PATIENT NAME" label. The `--spacing-screen-with-header` and `--spacing-screen-with-nav` tokens subtract those bars, and any renew banner, from the viewport height.

Content sits in centred containers. Planning pages lay cards in a responsive grid: one column on small screens and up to three at `lg`, as in Contact, Demographics and Physical measurements. Card interiors use 24px padding and 24px gaps, tightening to 16px below `sm`. Laptop and desktop are the primary targets and tablets must work. Phone layouts are planned but not committed, so don't design phone-only patterns yet.

Breakpoints are Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).

### Named Rules

**The One Glance Rule.** On a session screen, the exercise name, set and rep counters and the Pause/Resume control sit above the fold at 1280×800 without scrolling.

## Elevation & Depth

The Console uses a soft lift: surfaces are white, edged with a hairline border, and raised by a small ambient shadow. Overlays (dialogs, popovers, dropdowns, sheets) sit visibly above the page with larger shadows. The frosted top bar uses a drop shadow and a light backdrop blur, and is the only translucent surface.

### Shadow Vocabulary

- **Hairline lift** (`shadow-xs`): buttons and inputs.
- **Card lift** (`shadow-sm`, or `shadow` on the session panel): cards and panels at rest.
- **Overlay** (`shadow-md` on popovers and menus, `shadow-lg` on dialogs and sheets): anything floating over the page.

### Named Rules

**The Border Before Shadow Rule.** Every raised surface has a hairline border first. The shadow only softens the edge and never replaces the border.

## Shapes

The shapes are gently rounded, built from a 10px base radius (`--radius: 0.625rem`). Buttons, inputs, badges and sidebar items use 8px. Cards and panels use 14px. Avatars, status dots, toggles and pill chips (such as the email chip on a patient header) are fully round. Icon tiles inside card headers are small Mist squares with 8px corners. Corners never go sharp, and nothing goes past 14px apart from fully round shapes.

## Components

### Buttons

Steady and unmistakable: clear targets you can hit at a glance, with one obvious primary per area.

- **Shape:** 8px corners. Default height is 36px (`sm` is 32px, `lg` is 40px). Icon and label sit 8px apart.
- **Primary (Vital Teal):** the next action. White Body-size text at weight 500 with a hairline shadow. On hover the background drops to 90% opacity. In dark mode it becomes Vital Teal Mist with zinc-900 text.
- **Default (Graphite):** a strong but non-brand action, used where teal would compete.
- **Outline:** secondary actions (Previous, Next, Cancel). Paper fill, hairline border, and Mist on hover.
- **Ghost / Link:** tertiary actions in toolbars and rows.
- **Destructive:** for Delete and End session, use the outline form with red text and a red/40 border. The solid red fill is for the final confirm inside a destructive dialog only.
- **Focus:** a 3px ring in the ring colour at 50%, plus a border-colour shift. Never remove it.
- **Disabled:** 50% opacity, with no pointer events.

### Session Transport (signature)

The running-session controls: Previous (outline), a wide Vital Teal Pause/Resume that takes the remaining row (`flex-1`, minimum 160px), Next (outline), and End session set apart on the right in the red-outline form. All are 56px tall with 16px text and 20px icons, so they can be hit without looking twice.

### Session Running Panel (signature)

A card with 16–24px padding and the card lift. When the session is live its border turns emerald/40. It shows a status line (green dot, "In session", "Exercise 1 of 2"), the exercise name at Headline size, set and rep counters at Metric size with Label-size units, and the Session Transport.

### Cards / Containers

- **Corner style:** 14px.
- **Background:** Paper, with Ink text.
- **Shadow strategy:** Card lift (see Elevation & Depth).
- **Border:** Hairline, always.
- **Internal padding:** 24px with 24px vertical gaps. A header with a bottom border adds 24px below it.
- **Card headers** on form sections pair a small Mist icon tile with a Title-size label.

### Inputs / Fields

- **Style:** 36px tall, 8px corners, hairline stroke, transparent fill (input/30 in dark mode), and Body-size text (16px on small screens to prevent zoom).
- **Focus:** 3px ring at 50% plus a border-colour shift.
- **Error:** red border and a red/20 ring, with the message in red below the field.
- **Disabled:** 50% opacity, not-allowed cursor.

### Badges / Chips

- **Style:** 8px corners, 2px × 8px padding, Label typography. Variants are Default (Graphite), Secondary (Mist), Outline and Destructive.
- **Selection highlight:** selected exercise cards, filters and the favourites toggle use the cyan highlight ring (`ring-cyan-highlight`: 2px `cyan-400` border and 2px `cyan-300` ring at 35%) to show what is chosen in the exercise library.

### Navigation

- **Sidebar:** a Rail surface with a hairline right edge. Items use 16px text with 16px icons, 32px rows and 8px corners. The active or hover item fills with Mist. Below the items sit the Subscribe button (Vital Teal), the Remaining Time card and the account controls. The sidebar collapses to icons.
- **Top bar:** the frosted 60px bar holds the sidebar toggle on the left, and Dashboard plus the user's name and avatar on the right.
- **Patient sub-nav:** text tabs, with the active tab as a solid Vital Teal pill in white text.
- **Tabs (in-page):** a Mist rail with the active tab as a Paper chip carrying the hairline lift.

### Save Bar

A sticky bottom bar on editable records. On the left, an amber dot and "Unsaved changes" in Slate Muted. On the right, Delete (red outline) and Save changes (Vital Teal).

## Do's and Don'ts

### Do:

- **Do** reserve Vital Teal (#08899a) for the next action on the screen, with one per area.
- **Do** put a hairline border on every card and panel, then add the soft lift.
- **Do** set every changing number in tabular figures, at Metric size with a Slate Muted unit.
- **Do** make in-session controls 56px tall and put the live state (green dot, emerald border) where the clinician will see it first.
- **Do** keep red for ending and deleting. Use the outline form, and keep the solid fill for the final confirm.
- **Do** check every new label in Greek as well as English before calling a layout done.
- **Do** design laptop first and confirm the layout holds on a tablet.

### Don't:

- **Don't** add streaks, confetti, gamified badges or bright motivational gradients. The Console must not look like a consumer fitness app.
- **Don't** use dark neon glows, HUD frames or sci-fi styling, even on headset and casting screens.
- **Don't** build grey form walls, cramped tables or tiny controls like a legacy hospital EHR.
- **Don't** use green, amber or red for decoration or category coding. They report state only.
- **Don't** drop the hairline border to rely on shadow alone, and don't round past 14px except for fully round shapes.
- **Don't** introduce a second display typeface. Geist carries the whole hierarchy.
