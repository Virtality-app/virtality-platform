# Clinician-Scoped Reusable Programs

Patient programs will become clinician-scoped reusable programs rather than patient-owned treatment plans. Presets will be folded into the same model as starter templates or migrated clinician programs, while patient sessions keep their own persisted exercise rows that become frozen clinical history when the session completes.

This avoids forcing clinicians to recreate the same program for each patient, removes the separate preset workflow, and keeps live session changes from accidentally mutating reusable library content.

## Consequences

- Programs are selected from a clinician's Program Library and are not assigned to patients; patient-specific convenience comes from the Last Used Program and session history.
- A session starts only after VR start acknowledgement; before that, the UI is in a launch attempt, not a clinical session.
- Active sessions persist a mutable session working copy, then freeze it as the session exercise snapshot on completion.
- Updating a reusable program from a completed session is an explicit completion choice, alongside finishing only or saving the session working copy as a new reusable program.
- Starter templates are system-managed creation aids, not treatment-time choices; clinicians preview the included exercises, then customize a reusable program copy.
- Production rollout needs schema migrations plus a tested one-time data migration script, preserving existing patient-program IDs where possible and removing legacy patient ownership.
