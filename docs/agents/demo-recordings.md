# Demo recordings

A feature or bug fix that a user can see or click ships with a **demo**: a short recording of the change working in the running app. Reviewers watch it instead of checking out the branch. The demo is attached to the issue's Linear twin and linked from the PR's `## Demo` section.

## What to record

One flow, under about 30 seconds, that starts where a user would start and ends on the visible result.

- **Feature:** the user doing the new thing, ending on the outcome (the saved row, the new card, the changed state).
- **Bug fix:** the reproduction steps from the issue, now ending on the correct behaviour.
- **Headset feature:** run the Simulated Headset (`docs/agents/headset-sim.md`) and record the console side of the flow.

Record against your branch running locally. The app's dev server must be up (`pnpm --filter @virtality/<app> dev`); for the console that also means the API server, and the socket server for anything live.

## Record it

Demos are short Playwright scripts recorded by `pnpm demo`, which works for any app listed in `tooling/demos/apps.ts` (console, adminboard, website). Playwright runs its own headless browser, so you don't need Claude in Chrome. Don't use it for demos: it costs a screenshot per step and depends on the person's live browser.

1. **Sign in once** (apps with `signIn: true`). Run `pnpm demo:login <app>` in the background and ask the person to sign in in the browser window it opens. It saves the session to `tooling/demos/.auth/<app>.json` as soon as the sign-in lands and exits. Later demos reuse it until it expires; `pnpm demo` says when to sign in again.
2. **Write the script** at `tooling/demos/scripts/<name>.demo.ts`. Copy `scripts/example.demo.ts`. Scripts are local and git-ignored. Durable coverage belongs in the e2e suite, not here.
   - Import `test` and `expect` from `../demo.ts`. The page shows a ring where the mouse is, and the recording holds on the final state for 2 s.
   - `page.goto('/path')` is relative to the app's local URL.
   - Find elements by role and visible text (`getByRole('button', { name: 'Finish' })`), the way a user would.
   - Call `await beat()` after each visible change so a viewer can follow it.
   - End with an `expect` on the visible result, so a broken flow fails instead of producing a recording of the wrong thing.
3. **Record:** `pnpm demo <app> <name>`, e.g. `pnpm demo console therapies-by-default`. Output: `tooling/demos/out/<name>.gif` and `<name>.png`, the last frame. Pass `--name <issue-number>-demo` to set the file name.
4. **Check the result** by looking at `<name>.png` only. It should show the outcome. Don't open the GIF.

When a run fails, there's no GIF. Read the `error-context.md` path it prints first: a text snapshot of the page at the failure, cheaper than a screenshot. Then fix the script or the code and run the same command again.

**Headset features:** start the Simulated Headset (`docs/agents/headset-sim.md`) and pair it before recording. The script drives the console side only.

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
- **No app to record against** (Sandcastle and other runs without the dev servers or a person to sign in): `No demo: no running app in this run.`
- **No Linear twin** (issue filed before sync): keep the GIF, give the user its path in your final message, and write `Demo recorded locally: <path>`.
