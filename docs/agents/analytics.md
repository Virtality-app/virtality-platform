# Product analytics

Console usage goes to PostHog (EU). The contract in `packages/analytics/src/contract.ts` is the single source of truth: every event name and its properties live there, in one of two maps.

Every contract event is also saved to our own database, in the `ProductEvent` table, under the same uuid PostHog gets. PostHog is for exploring and dashboards; `ProductEvent` is our record, which we can join with users, patients and sessions in SQL. Autocapture, page views, web vitals and session replays stay in PostHog only.

## Client or server

- **Server event** (`ServerEventPayloadMap`): the action persists something through an oRPC procedure. Capture it in the procedure after the write succeeds, with `context.analytics?.capture({ distinctId: context.user.id, ... })`. Ad blockers and closed tabs cannot drop it.
- **Client event** (`ClientEventPayloadMap`): only the UI knows it happened (a launch attempt, a blocked launch, a tour step, a tab). Capture it with `trackAnalyticsEvent` from `apps/console/lib/analytics-contract.ts`. ESLint rejects `posthog.capture` anywhere else in the console.

Each event lives in one map only. Page views are PostHog's built-in `$pageview` (`capture_pageview: 'history_change'`), so a route needs no event of its own; state that never reaches the URL, such as patient profile tabs, does.

## Adding an event

1. Add it to the right map in the contract: snake_case `object_action`, past tense (`program_retired`). Properties hold ids, counts, durations and enum values. Patient names, notes, medical history and any free text stay out of analytics. A client event also goes in `clientEventNames` in the same file; the build fails until it does. The API rejects client events it doesn't list.
2. Capture it at the point the action succeeds. Both captures save the event to `ProductEvent` too, so there's nothing else to call.
3. Run `pnpm build:packages` so apps pick up the new contract from `dist/`.

Keep the names of events that already ship. Renaming one splits its history in PostHog.

## Person properties

The console identifies with `user.id`, and the server uses the same id as `distinctId`. `identifyPostHogUser` sets `role`, `is_internal` (admins only; some clinics doing real work hold the tester role), `email_verified`, and `signup_at` (set once). Server events carry the activation milestones (`first_*_at` set once, `last_treatment_session_at` overwritten) through `set` / `setOnce`. Product dashboards filter on `is_internal = false`.

## Session replay privacy

The console records sessions, so anything on screen can reach PostHog. `apps/console/lib/posthog-replay-privacy.ts` holds the rules:

- Inputs are masked unless they spread `unmaskedInputProps`. Add it only to inputs that never hold personal data, such as exercise settings or the exercise search.
- Text is shown unless an element (or an ancestor) has the `ph-sensitive` class. Put it on every patient or clinician name, contact detail, photo, session note and other medical text. It also hides images inside it and keeps the text out of autocapture.
- Use `ph-no-capture` where personal data sits in an attribute (an `aria-label` with a patient name, a cmdk item's `data-value`) or shows through position or colour (the pain slider, the body map). The element becomes a blank box in replays.

## Configuration

`services/server` reads `POSTHOG_PROJECT_TOKEN` (and optionally `POSTHOG_HOST`). It must be the same project key as the console's `NEXT_PUBLIC_POSTHOG_KEY`, or server events land on persons the console never identified. When it is unset, server events are still saved to `ProductEvent` but not sent to PostHog.

## Our copy: `ProductEvent`

- **Server events:** `createServerAnalytics` takes a `store`. `services/server/src/lib/analytics.ts` passes one that writes to `ProductEvent`. A failed write is logged and never fails the request.
- **Client events:** `trackAnalyticsEvent` sends the event to PostHog, then to the `productEvent.track` procedure with PostHog's uuid and `$session_id`. The procedure takes the user from the session, accepts only names in `CLIENT_EVENT_NAMES`, and only flat, short properties. The request uses `keepalive`, so events sent as the tab closes still arrive.
- **Consent:** contract events are necessary to run the service, so the console offers no way to decline them and `ProductEvent` always saves them. If PostHog capturing is ever opted out, PostHog drops its copy and `trackAnalyticsEvent` saves ours under a uuid of its own.
- **Deletion:** account deletion soft-deletes the user (`deletedAt`, anonymised email), so their events stay, like the rest of their data. Removing the `User` row deletes their events too (`userId` cascades).
