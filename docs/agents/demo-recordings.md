# Demo recordings

A feature or bug fix that a user can see or click ships with a **demo**: a short recording of the change working in the running app. Reviewers watch it instead of checking out the branch. The demo is attached to the issue's Linear twin and linked from the PR's `## Demo` section.

## What to record

One flow, under about 30 seconds, that starts where a user would start and ends on the visible result.

- **Feature:** the user doing the new thing, ending on the outcome (the saved row, the new card, the changed state).
- **Bug fix:** the reproduction steps from the issue, now ending on the correct behaviour.
- **Headset feature:** run the Simulated Headset (`docs/agents/headset-sim.md`) and record the console side of the flow.

Record against your branch running locally (`localhost:3001` for the console). The console needs a signed-in user, so ask the user to sign in in that tab before you start recording.

## Record it

Use the Claude in Chrome GIF recorder (load the `claude-in-chrome` skill first):

1. Open the starting page in a new tab and resize it to a readable size, e.g. 1280×800.
2. `gif_creator` `start_recording`, then take a screenshot so the first frame is the starting state.
3. Run the flow. Pause on the result for a moment, and take a screenshot so the last frame shows it.
4. `stop_recording`, then `export` with `download: true`, `filename: "<issue-number>-demo.gif"` and `options: { showWatermark: false }`.
5. The GIF lands in the browser's download folder. Find it with `ls -t ~/Downloads | head`.

Watch for flows that went wrong partway (a toast error, a spinner that never stopped). If the recording shows one, fix the cause and record again. The demo must show the change working.

## Attach it to the Linear twin

Find the issue's Linear twin as described in `docs/agents/issue-tracker.md`, then upload the file in one go, because the signed URL expires after 60 seconds:

1. `prepare_attachment_upload` with the `CORE-<n>` id, the filename, `contentType: "image/gif"` and `size` from `stat -c%s <file>`.
2. `curl -X PUT --data-binary @<file>` to `uploadRequest.url`, sending every header in `uploadRequest.headers` exactly as returned.
3. `create_attachment_from_upload` with the `assetUrl` and a title like `Demo: <what it shows>`.

Done when `get_issue` with `fields: ["attachments"]` lists the demo.

## The PR's `## Demo` section

Link the Linear issue and name the attachment, plus one line on what the recording shows:

```md
## Demo

Attached to [CORE-123](<linear issue url>) as "Demo: filter customers by trial status". Opens the customer table, filters to Trial and shows only trial accounts left.
```

When there's no demo, the section still exists and says why in one line:

- **No visible change** (backend-only, refactor, tooling): say what you ran instead, e.g. the tests or the API call.
- **No browser** (Sandcastle and other headless runs): `No demo: recorded in a headless run.`
- **No Linear twin** (issue filed before sync): keep the GIF, give the user its path in your final message, and write `Demo recorded locally: <path>`.
