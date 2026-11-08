# @virtality/demos

Records short demo GIFs of any app in the monorepo with Playwright, for PR reviews. The full workflow, including attaching the GIF to Linear, is in `docs/agents/demo-recordings.md`.

```sh
pnpm demo:login console                # once: sign in in the window that opens
pnpm demo console my-change            # runs scripts/my-change.demo.ts
open tooling/demos/out/my-change.gif
```

- **Apps:** `apps.ts` lists each app's local URL and whether it needs a sign-in. Add an entry to record a new app.
- **Scripts:** `scripts/*.demo.ts`, git-ignored except `example.demo.ts`. Import `test` from `../demo.ts` for the visible cursor and the held last frame.
- **Browser:** your installed Chrome by default. Set `DEMO_BROWSER_CHANNEL=chromium` to use Playwright's own build instead (downloaded on first run).
- **Pace:** Playwright waits `DEMO_SLOWMO` ms (default 250) between actions.
- **Needs:** `ffmpeg` on the PATH for the GIF.
