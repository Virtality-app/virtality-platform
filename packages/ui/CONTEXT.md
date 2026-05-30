# UI package context

`@virtality/ui` hosts the **Shared UI Bucket** and React Email templates.

## Boundaries

- **In scope**: Reusable primitives/composites promoted from console, website, and adminboard; email templates for platform messaging.
- **Out of scope**: App-domain widgets (exercise library, VR controls, admin data tables, etc.) — those remain **Local App UI**.

## Consumers

| Consumer | Usage |
| --- | --- |
| console | Phase-1 shared primitives (after promotion) |
| website | Phase-1 shared primitives (after promotion) |
| adminboard | Phase-1 shared primitives (after promotion) |
| server / nodemailer / orpc | Email templates only (today) |

## Contract

See [CONTRACT.md](./CONTRACT.md) for Promotion Gate, canonical imports, token semantics, and ownership.

Programmatic registry: `@virtality/ui/contract`.
