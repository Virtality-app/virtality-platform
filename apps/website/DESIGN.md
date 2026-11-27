---
name: Virtality Website
description: Public site for evidence-based VR physiotherapy. Because every move matters.
colors:
  vital-teal: '#08899a'
  vital-teal-bright: '#0ab1c6'
  vital-teal-deep: '#06626e'
  vital-teal-glow: '#39dff5'
  vital-teal-mist: '#bdf4fc'
  vital-teal-wash: '#e9fbfe'
  slate-ink: 'oklch(0.208 0.042 265.755)'
  slate-body: 'oklch(0.446 0.043 257.281)'
  slate-muted: 'oklch(0.554 0.046 257.417)'
  hairline: 'oklch(0.922 0 0)'
  slate-mist: 'oklch(0.984 0.003 247.858)'
  paper: 'oklch(1 0 0)'
typography:
  display:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: '4.75rem'
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '3rem'
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.3
  lead:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.4
  metric:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 700
    lineHeight: 1.1
  meta:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.18em'
rounded:
  md: '8px'
  lg: '10px'
  xl: '14px'
  2xl: '16px'
  full: '9999px'
spacing:
  sm: '8px'
  md: '16px'
  lg: '32px'
  xl: '64px'
  section: '96px'
components:
  cta-primary:
    backgroundColor: '{colors.vital-teal}'
    textColor: '{colors.paper}'
    typography: '{typography.body}'
    rounded: '{rounded.full}'
    padding: '16px 28px'
  cta-primary-hover:
    backgroundColor: '#08899ae6'
  cta-secondary:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.vital-teal}'
    rounded: '{rounded.md}'
    padding: '16px 24px'
  nav-login:
    backgroundColor: '{colors.vital-teal}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    height: '36px'
  nav-signup:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.vital-teal}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    height: '36px'
  stat-strip:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.slate-ink}'
    rounded: '{rounded.xl}'
    padding: '32px'
  feature-card:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.slate-ink}'
    rounded: '{rounded.xl}'
    padding: '32px'
  promo-band:
    backgroundColor: '{colors.slate-ink}'
    textColor: '{colors.paper}'
    padding: '96px 16px'
  blog-meta:
    textColor: '{colors.slate-muted}'
    typography: '{typography.meta}'
---

# Design System: Virtality Website

## Overview

**Creative North Star: "Movement, Made Visible"**

The website shows two things side by side. One is invisible: the neural retraining that lets a patient move past pain fear and compensation. The other is visible: real clinicians, real patients and real clinic rooms. The hero carries both at once, with a patient in a headset and a luminous neural mesh tracing the arm they are moving. The rest of the page alternates between those registers. Teal light and clean data frame the science. Clinic photos, testimonials, partners and press carry the proof.

The mood is confident, clinical and luminous. Grounds are white and near-white slate, lit by soft Vital Teal washes and blurred teal glows. Headlines are large and plain-spoken, in DM Sans, with one Fraunces serif moment in the hero for the tagline. Components are confident and inviting. The primary call to action is a big rounded teal pill with a soft teal glow, and every section ends within reach of a next step: start the free trial or book a demo.

The site is light-first. A single dark band (the product video) gives the page one change of key. Nothing on the site may be invented: metrics, testimonials, clinic names and partners come only from the confirmed evidence in `PRODUCT.md`.

**Key Characteristics:**

- White and slate-mist grounds lit by Vital Teal washes and blurred glows.
- DM Sans for everything, with one Fraunces serif moment for the hero tagline.
- Large teal pill CTA with a soft teal glow; trial and demo always within reach.
- Real clinic photography and video as proof, never stock "VR" imagery.
- One dark band per page, for the product video.
- A frosted sticky nav; a mono date rail on the blog.

## Colors

One teal family carries the brand across cool slate neutrals. It lights the page rather than filling it.

### Primary

- **Vital Teal** (vital-teal): the brand and action colour. The primary CTA pill, nav Login, accent words in headings, metric figures, icon tiles and link hover.
- **Vital Teal Bright** (vital-teal-bright): the end of the legacy accent-word gradient, and the accent in hover states.
- **Vital Teal Deep** (vital-teal-deep): text on teal-tinted grounds (badges and pills) where Vital Teal lacks contrast.
- **Vital Teal Glow** (vital-teal-glow): used only at about 10% opacity, as large blurred radial glows behind sections and cards.
- **Vital Teal Mist** (vital-teal-mist) and **Vital Teal Wash** (vital-teal-wash): card borders, nav border (at 50%), soft section tints and icon-tile fills.

### Neutral

- **Slate Ink** (slate-ink): headings, and the background of the dark product-video band.
- **Slate Body** (slate-body): body and lead copy.
- **Slate Muted** (slate-muted): captions, stat sub-labels and the blog meta rail.
- **Hairline** (hairline): dividers and neutral borders.
- **Slate Mist** (slate-mist): alternate section grounds, and the start of the slate-to-white section gradients.
- **Paper** (paper): page, cards, nav (at 80% with blur).

### Named Rules

**The Teal Is Light Rule.** Vital Teal appears as a light source (the CTA, accent words, figures, glows), not as large filled areas. No section has a solid teal background.

**The One Dark Band Rule.** A page has at most one dark Slate Ink band, and it holds the product video. Everything else is light.

## Typography

**Display Font:** Fraunces (500, normal and italic), loaded in `sections/hero/components/hero-title.tsx`
**Body Font:** DM Sans (400–700), mapped to Tailwind `font-sans`
**Mono Font:** JetBrains Mono (400–600), mapped to Tailwind `font-mono`

**Character:** DM Sans is geometric, friendly and clear. It carries headlines and copy with confidence and no fuss. Fraunces gives the brand line one warm, editorial serif moment, and its italic "matters." in Vital Teal is the only italic on the site. JetBrains Mono is for dates and meta only.

### Hierarchy

- **Display** (Fraunces 500, about 4.75rem on desktop and scaling down on phones, line-height 1.05): the hero tagline "Because every move matters." only. Its last word is set in italic Vital Teal.
- **Headline** (DM Sans 700, 3rem, line-height 1.1): section headings, with one accent phrase in Vital Teal.
- **Title** (DM Sans 600, 1.25rem): card, benefit and post titles.
- **Lead** (DM Sans 400, 1.25rem, line-height 1.6): the supporting sentence under a hero or section heading, in Slate Body.
- **Body** (DM Sans 400, 1rem, line-height 1.6): card and article copy, with a 65–75ch measure in Posts.
- **Label** (DM Sans 600, 0.875rem): buttons and nav.
- **Metric** (DM Sans 700, 2.25rem, Vital Teal): evidence figures (70–97%, 97%, 2.5x), with a Body-size label and a Slate Muted caption.
- **Meta** (JetBrains Mono 400, 0.75rem, uppercase, tracking 0.18em): blog dates, the Featured flag and author rails.

### Named Rules

**The One Serif Rule.** Fraunces appears once per page, for the hero tagline. Every other heading is DM Sans.

**The Font Wiring Rule.** `next/font` variables live on `<html>` (`app/layout.tsx`), and `--font-sans` / `--font-mono` map to them in `app/globals.css`. If they move to `<body>`, the site silently falls back to the system font.

## Layout

The page is a vertical run of full-width sections. Each one is a feature folder under `sections/`, composed by `app/page.tsx`. Sections use a centred container (16px side padding, 32px from `md`) with vertical padding of 32–64px on phones and 64–96px on desktop. Content inside is held to readable widths (`max-w-5xl` for stat strips, `max-w-2xl` for lead copy). Headings are centred in most sections and left-aligned where they sit beside an image (Benefits) or lead a carousel (Testimonials).

The nav is a sticky 60px frosted bar: white at 80% with a medium backdrop blur and a hairline Vital Teal Mist border. It has the logo on the left, and social icons, Blog, Sign Up and Login on the right. On phones it collapses to Sign Up, Login and a menu button. Phone layouts turn card grids into stacked accordions (Benefits grid) and keep the three evidence metrics in one compact row.

The blog uses a meta-rail layout: a mono date and author rail on the left, title, excerpt and author in the centre, and the Cover image on the right, with posts separated by hairline rules.

Breakpoints are Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).

## Elevation & Depth

Depth here is light, not structure. Cards lift on soft, wide shadows, and the key ones (the CTA pill, the featured testimonial, the final CTA card) cast a teal-tinted glow (Vital Teal at 20–30%). Large blurred radial glows of Vital Teal Glow at about 10% sit behind sections to make the page feel lit. The nav and a few overlays use backdrop blur as frosted glass, for a specific reason: content scrolls beneath them.

### Shadow Vocabulary

- **Soft lift** (`shadow-sm`): stat strips and resting cards.
- **Lifted** (`shadow-lg` / `shadow-xl`): featured cards, the final CTA card and imagery panels.
- **Teal glow** (`shadow-lg` tinted `vital-blue-700/25`, rising to `/30` on hover): the primary CTA pill and featured elements.
- **Ambient glow** (a `blur-3xl` radial at `vital-blue-400/10`): behind sections, never on text.

### Named Rules

**The Glow Means Focus Rule.** Teal-tinted shadows go only on the element the visitor should look at or press next. Neutral cards get neutral shadows.

## Shapes

The shapes are soft and generous. The primary CTA, badges, carousel controls and social-proof chips are fully round pills. The promo video frame uses 16px corners. Feature and benefit cards, stat strips, testimonial cards, mosaic tiles and the waitlist input group use 14px. Icon tiles use 8px on phones and 14px from `md`. Nav buttons and the secondary CTA use 8px. Imagery is clipped into rounded tiles that match their container. The final CTA card carries an 8px Vital Teal gradient bar across its top edge.

## Components

Confident and inviting: big, clear next steps with a soft teal glow, framed by calm proof.

### Primary CTA (signature)

A Vital Teal pill (fully round, 16px × 28px padding) with white 16px semibold text, a trailing arrow and the teal glow. On hover the glow deepens to 30% and the arrow nudges right. It is used for "Try Virtality free for two weeks" in the hero and "Start now" in the final CTA. There is one per viewport.

### Secondary CTA

The secondary CTA is a white button with a 2px Vital Teal border, Vital Teal text in 16px semibold, 16px × 24px padding, 8px corners and a Vital Teal Wash hover, used for "Book a 20-minute demo". It sits below the primary, separated by a quiet divider line.

### Nav Buttons

Sign Up is a white outline button with a Vital Teal border and text. Login is solid Vital Teal with white text. Both use 8px corners, a 36px height and Label type. Social icons are Slate Body and take their own brand colour on hover.

### Stat Strip

A white card with 14px corners and the soft lift, holding the three confirmed evidence figures in columns separated by hairline dividers. Each column has a Metric figure in Vital Teal, a Body label in Slate Ink and a Slate Muted caption.

### Feature / Benefit Cards

White cards with 14px corners, a Vital Teal Mist border and the soft lift. Each holds a teal-gradient icon tile (Vital Teal to Vital Teal Bright, 36px on phones and 48px from `md`, with a teal glow) holding a white icon, then a Title and Body copy in Slate Body. On phones the benefit grid becomes accordions with the same icon tiles.

### Testimonial Carousel

A centred, lifted card with a teal glow behind it, a Vital Teal quote mark, the quote at Lead size, and the speaker's role and clinic in bold Label type above a Vital Teal Mist rule. The cards on either side are faded and cut off. Round outline arrow buttons sit below.

### Mosaic

A masonry grid of real clinic photos and clips in rounded tiles, under a centred heading and lead.

### Promo Video Band

The page's one dark band. A Slate Ink background with a soft teal glow holds a centred white heading, a lead in light slate, and the video in a 16px-cornered frame with a 2px Vital Teal border at 30% and a deep shadow. Four capability figures in teal sit beneath it.

### Partner & Press Rows

Logos sit in rows under small letterspaced dividers ("Strategic partnership", "Clinical partners"), with press logos in a horizontal scroller. Logos keep their own colours.

### Blog Index and Post

These use the meta-rail list described in Layout. Post titles are Title-to-Headline size in DM Sans, excerpts are Slate Body, and the meta is set in JetBrains Mono.

### Cookie Banner

A white card fixed bottom-right with a Vital Teal Mist border, a letterspaced Vital Teal "Cookie note" label, Body copy, and Decline (outline) / Accept (solid teal) buttons.

## Do's and Don'ts

### Do:

- **Do** keep one Vital Teal pill CTA per viewport, and keep "Book a 20-minute demo" one step away.
- **Do** use DM Sans for every heading except the hero tagline, which is Fraunces.
- **Do** set evidence figures in Vital Teal at Metric size, using only the figures confirmed in `PRODUCT.md`.
- **Do** use real clinic photos and video for proof.
- **Do** mark the accent phrase of a heading in solid Vital Teal.
- **Do** keep the `next/font` variables on `<html>` so DM Sans and JetBrains Mono apply.

### Don't:

- **Don't** add new gradient text. The Vital Teal 700→600 accent-word gradient on existing headings is legacy, so use solid Vital Teal instead.
- **Don't** add new pill labels above headings (such as "Why clinics choose Virtality"). The existing ones are legacy, and the heading should carry the section on its own.
- **Don't** fill sections with solid teal, or add a second dark band.
- **Don't** invent or extrapolate metrics, testimonials, clinic names, partners or press.
- **Don't** use stock VR or sci-fi imagery, or neon glows. The teal light stays soft and clinical.
- **Don't** use Fraunces anywhere except the hero tagline.
