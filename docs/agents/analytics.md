# Product analytics

Console usage goes to PostHog (EU). The contract in `packages/analytics/src/contract.ts` is the single source of truth: every event name and its properties live there, in one of two maps.

## Client or server

- **Server event** (`ServerEventPayloadMap`): the action persists something through an oRPC procedure. Capture it in the procedure after the write succeeds, with `context.analytics?.capture({ distinctId: context.user.id, ... })`. Ad blockers and closed tabs cannot drop it.
- **Client event** (`ClientEventPayloadMap`): only the UI knows it happened (a launch attempt, a blocked launch, a tour step, a tab). Capture it with `trackAnalyticsEvent` from `apps/console/lib/analytics-contract.ts`. ESLint rejects `posthog.capture` anywhere else in the console.

Each event lives in one map only. Page views are PostHog's built-in `$pageview` (`capture_pageview: 'history_change'`), so a route needs no event of its own; state that never reaches the URL, such as patient profile tabs, does.

## Adding an event

1. Add it to the right map in the contract: snake_case `object_action`, past tense (`program_retired`). Properties hold ids, counts, durations and enum values. Patient names, notes, medical history and any free text stay out of analytics.
2. Capture it at the point the action succeeds.
3. Run `pnpm build:packages` so apps pick up the new contract from `dist/`.

Keep the names of events that already ship. Renaming one splits its history in PostHog.

## Person properties

The console identifies with `user.id`, and the server uses the same id as `distinctId`. `identifyPostHogUser` sets `role`, `is_internal` (admins only; some clinics doing real work hold the tester role), `email_verified`, and `signup_at` (set once). Server events carry the activation milestones (`first_*_at` set once, `last_treatment_session_at` overwritten) through `set` / `setOnce`. Product dashboards filter on `is_internal = false`.

## Configuration

`services/server` reads `POSTHOG_PROJECT_TOKEN` (and optionally `POSTHOG_HOST`). It must be the same project key as the console's `NEXT_PUBLIC_POSTHOG_KEY`, or server events land on persons the console never identified. When it is unset, server analytics is a no-op.
