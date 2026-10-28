# UI System

Shared UI language for reusable components consumed by multiple apps.

## Language

**Shared UI Bucket**:
The canonical set of reusable UI components that live in `packages/ui` and are intended for cross-app reuse.
_Avoid_: Common dump, random shared folder

**Local App UI**:
UI components that remain app-specific and stay within an individual app context (for example `apps/console/components`).
_Avoid_: Shared component, universal component

**Promotion Gate**:
The rule for moving a component from **Local App UI** to the **Shared UI Bucket**: used by at least two apps, free of app-domain logic.
_Avoid_: Ad-hoc move, opportunistic copy

## Promoted chrome primitives

Shared sidebar stack used by console and adminboard:

- `sidebar`
- `sheet`
- `tooltip`
- `hooks/use-mobile`

Apps keep local nav config and layout composition; only the primitives live here.

## Console re-exports

The console's `components/ui/` files for `dropdown-menu`, `popover`, `select`, `sheet`, `sidebar`, `skeleton`, `switch` and `tooltip` are one-line `export *` re-exports of the shared primitive. Change the shared file, not the re-export. Console-specific styling goes at the call site through `className`.

The console's `components/ui/` holds generic primitives only. Feature components live in `components/<feature>/` or in a route `_components/` folder.

## Primitive Migration Triage

Current duplicate UI primitives with conflicts (not zero-conflict yet):

- `button`
- `calendar`
- `chart`
- `checkbox`
- `combo-select`
- `command`
- `dialog`
- `exercise-input-pill`
- `field`
- `form`
- `navigation-menu`
- `table`
- `tabs`
