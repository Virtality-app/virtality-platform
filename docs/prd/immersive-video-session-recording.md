# Recording Immersive Video sessions

Status: **Proposed, not started** (parked 2026-11-10)

## Problem

Immersive Video playback is not saved anywhere in the database. The console sends play, pause and stop commands to the headset and keeps the playback state only in the browser ([docs/architecture/immersive-video.md](../architecture/immersive-video.md) says "Session tracking: None").

So nothing can report how often clinicians use VR videos, with which patients, or for how long. The adminboard Dashboard (Overview, Sessions and Clinicians tabs, branch `feat/adminboard-dashboard-tabs`) already splits every number into Exercise and VR video. Until videos are recorded, every session counts as Exercise.

## What already leaves a trace (for a one-off backfill, not as a data source)

| Source                                                                                                                                                | What it holds                                                                                                                                                                                                               | Since (production)                | Missing                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `DeviceVideo` / `DeviceVideoReport` tables                                                                                                            | Which videos each headset has downloaded                                                                                                                                                                                    | Videos first published 2026-09-17 | Plays                                                               |
| Socket relay logs in Grafana/Loki (`socket.relay.emit`, [server-device-controller.ts](../../services/socket/src/sockets/server-device-controller.ts)) | `videoPlay`, `videoPlayAck`, `videoPause`, `videoStop`, `videoStopAck`, `videoEnded` with timestamp, `videoId` and `roomCode`. The room code is the headset `deviceId`, which maps to the clinician through `Device.userId` | 2026-09-15                        | Patient. Retention depends on the Grafana setup and wasn't checked  |
| PostHog `immersive_video_play_requested` ([use-immersive-video-playback.ts](../../apps/console/hooks/use-immersive-video-playback.ts))                | Clinician (person), `video_id`, time, and `$current_url` = `/patients/<patientId>/patient-dashboard`                                                                                                                        | 2026-11-08                        | Duration. Clinicians who declined analytics or block it are missing |

Matching a PostHog play event to the next `videoPlay` on that clinician's headset gives patient plus duration from 2026-11-08. Before that, only per-headset (per-clinician) plays and durations, if Loki still has them. This is good for a one-off answer to "how much has video been used", not for the Dashboard: it depends on retention, ad blockers and timestamp matching.

## Proposal: save video runs the way exercise sessions are saved

### How exercise sessions are saved today

1. Clinician starts treatment; the console waits for the headset to confirm (**Session Launch Attempt**).
2. On the headset's confirmation the server creates the `PatientSession` and its `SessionExercise` rows (`patientSession.startFromAck`, [patient-session.ts](../../packages/orpc/src/procedures/patient-session.ts), [session-start-from-ack.ts](../../packages/orpc/src/procedures/session-start-from-ack.ts)).
3. Progress is saved as treatment goes on.
4. The session ends through `patientSession.complete` or `patientSession.interrupt`.

### The video player already has the matching moments

The console's playback state machine ([immersive-video-playback-reducer.ts](../../apps/console/lib/immersive-video-playback-reducer.ts)) moves `Idle → Starting → Playing ⇄ Paused → Idle` on these actions:

| Reducer action                                                                                                                               | What to save                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `playAck` (headset confirms play)                                                                                                            | Create the video run: patient, clinician, headset `deviceId`, `videoId`, start time                |
| `progress` (`videoPlaybackProgress`: `positionSec`, `durationSec`)                                                                           | Furthest position reached, so pauses don't count as watching. Save at checkpoints, not every event |
| `ended`                                                                                                                                      | Complete the run, end reason `finished`                                                            |
| `stopAck` after a clinician Stop                                                                                                             | Complete the run, end reason `stopped`                                                             |
| `stopAck` after the **Session Time Limit** sent the stop ([use-immersive-auto-stop.ts](../../apps/console/hooks/use-immersive-auto-stop.ts)) | Complete the run, end reason `time_limit`                                                          |
| `memberLeft` then `reattachTimeout` (headset gone)                                                                                           | Mark the run interrupted, like an **Interrupted Session**                                          |

The headset app doesn't change: the console already receives every event it needs.

### Data model (sketch)

A new table next to `SessionExercise` in [patient-session.prisma](../../packages/db/prisma/models/patient-session.prisma):

```prisma
model SessionVideo {
  id               String         @id
  patientSessionId String
  videoId          String         // Video ID shared with headsets; no FK, the catalog row may be unpublished later
  deviceId         String         // headset identity (Device.deviceId)
  startedAt        DateTime       @db.Timestamp(6)
  endedAt          DateTime?      @db.Timestamp(6)
  maxPositionSec   Int?
  durationSec      Int?           // video length reported by the headset
  endReason        SessionVideoEndReason?
  patientSession   PatientSession @relation(fields: [patientSessionId], references: [id], onDelete: Cascade)
}

enum SessionVideoEndReason {
  finished
  stopped
  time_limit
  interrupted
}
```

Plus `sessionVideo SessionVideo[]` on `PatientSession`. Generate the migration with `pnpm db:migrate:dev` (see "Local setup warning" below).

### Server endpoints (sketch)

Mirroring `startFromAck` / `complete` / `interrupt`, in a new `packages/orpc/src/procedures/session-video.ts`:

- `sessionVideo.startFromAck({ patientId, videoId, deviceId })`: creates a new `PatientSession` and its `SessionVideo` row (see the decision below). Returns the run id.
- `sessionVideo.checkpoint({ id, maxPositionSec, durationSec })`: optional, saves progress.
- `sessionVideo.finish({ id, endReason, maxPositionSec })`.
- `sessionVideo.interrupt({ id })`.

The console calls these from `useImmersiveVideoPlayback`, the same way the patient-dashboard socket hook calls the exercise session endpoints. Keep the decision logic in a pure, tested module, as `session-start-from-ack.ts` and `session-completion.ts` do.

### Dashboard hook-up

The adminboard Dashboard reads session type through one function, `classifySession` in [session-type.ts](../../packages/orpc/src/procedures/adminboard/session-type.ts). Today both queries pass `videoMinutes: null` ([session-activity.ts](../../packages/orpc/src/procedures/adminboard/session-activity.ts)). Once `SessionVideo` exists, select the session's video minutes there instead (sum of `endedAt - startedAt`, or of watched positions) and VR video fills in across all three tabs. No UI changes are needed.

## Decided: video runs are their own sessions

The console doesn't let video mode and an exercise program run at the same time; the clinician switches between them on the patient dashboard. So every video run creates its own `PatientSession` with no exercises and one `SessionVideo`, and a session is either Exercise or VR video. The Dashboard no longer has a "Both" session type (removed 2026-11-10). Its Clinicians tab still shows how many patients had sessions of each kind ("Exercise and VR video").

A "join sessions in the same visit" rule was considered and dropped.

## Other things to settle when picking this up

- **Patient session history in the console:** the patient's sessions table and session card should show video runs: video title, minutes, end reason.
- **Completion Save Choice:** a video-only session has no program to save back, so it should complete without the save-choice dialog.
- **Pauses:** whether "minutes" means wall-clock time from play to stop, or time actually watched (from progress positions). The Dashboard currently uses wall-clock time for exercise sessions.
- **Backfill:** whether to rebuild history from Grafana and PostHog (see the table above) when this ships. Someone with access to both needs to check how far back Grafana logs go.
- **Analytics:** add server events like `immersive_video_run_started` / `_finished` alongside the existing treatment session events.

## Local setup warning

`packages/db/.env` sets `DATABASE_URL` to the **production** Neon database, and `prisma.config.ts` reads it. Any `prisma migrate` run from `packages/db` without overriding `DATABASE_URL` targets production. When generating or applying this migration locally, point `DATABASE_URL` at the local database (`localhost:5434/devdb`) for the command.
