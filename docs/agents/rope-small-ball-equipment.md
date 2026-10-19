# Rope and small-ball equipment

Equipment keys for local exercise authoring: `rope` and `small_ball`. Both are offered before the first exercise is published. They appear in Console equipment filters with dedicated transparent PNG icons. Body-part categories remain separate.

Unity inventory (2026-10-20), counting left/right separately: 4 rope and 6 small-ball exercises.

| Unity exercise name                | Exercise ID | Equipment key |
| ---------------------------------- | ----------- | ------------- |
| ExternalRotationThrow_L            | 149         | `small_ball`  |
| ExternalRotationThrow_R            | 150         | `small_ball`  |
| ExternalRotationTowelStretch_L     | 151         | `rope`        |
| ExternalRotationTowelStretch_R     | 152         | `rope`        |
| ExternalRotationwithMedicineBall_L | 153         | `small_ball`  |
| ExternalRotationwithMedicineBall_R | 154         | `small_ball`  |
| InternalRotationThrow_L            | 160         | `small_ball`  |
| InternalRotationThrow_R            | 161         | `small_ball`  |
| InternalRotationTowelStretch_L     | 162         | `rope`        |
| InternalRotationTowelStretch_R     | 163         | `rope`        |

Use these exact Unity names and IDs when adding the exercise variants. Unity already contains their ExerciseSOs and ItemSettings; no new Unity equipment enum values are required. Platform exercise uploads still need their own display name, description, body-part category, thumbnail, and demonstration video.

The default equipment keys are declared in `packages/shared/src/utils/clinical/normalize-exercise-equipment-key.ts`; both the clinician item-list API and Adminboard draft vocabulary use them. Icon paths are mapped in `apps/console/lib/equipment-icon.ts`.

Images were generated with the built-in image-generation tool: a white braided stretching rope in a loose U with knotted ends, and a cluster of three small blue, red, and yellow rubber physiotherapy balls, each photographed in soft studio lighting, centered with clear margins on a transparent background, without people, text, or logos.

Both equipment icons are 400 × 400 pixel transparent PNGs, matching the existing equipment images. The small-ball icon depicts three balls together to distinguish them visually from a large exercise ball.
