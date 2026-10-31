# Socket

Real-time bridge between the console frontend and VR headsets during treatment workflows.

Domain language: [`CONTEXT.md`](./CONTEXT.md).  
Suite setup: [`docs/onboarding/README.md`](../../docs/onboarding/README.md).

## Run locally

Port: **8081** (default)

```sh
# From repo root
pnpm --filter @virtality/socket dev

# Included in the full suite
pnpm dev:apps

# Full suite plus the Simulated Headset in pairing mode (see below)
pnpm dev:apps:sim
```

Copy [`.env.example`](./.env.example) to `.env`. The `dev` script requires that file (`--env-file=.env`).

## Env

| Variable | Required for local | Notes              |
| -------- | ------------------ | ------------------ |
| `ENV`    | recommended        | `development`      |
| `PORT`   | no                 | Defaults to `8081` |

No database connection is required for the socket process itself.

## Simulated Headset

A standalone client that joins a room as the `vr` peer and answers program and
video events the way the headset build does. The server carries no simulation
code; run it against a normally-running socket server.

**Pairing mode** (no `ROOM_CODE`): on the console's Devices page, add a device
and press Pair. About 2 s later the sim claims the code through the API
server's `/api/v1/device-pairing/claim` as a new `sim-xxxxxxxx` headset and
joins that device's room. Each Pair press starts another simulated headset.
The sim finds pending codes in the database, so it runs under `doppler run`
for `DATABASE_URL`.

```sh
# Pairing mode (API server defaults to http://localhost:8080)
pnpm --filter @virtality/socket dev_sim
SERVER_URL=http://localhost:8080 pnpm --filter @virtality/socket dev_sim

# Join an already-paired device's room (the device id in the console's dropdown)
ROOM_CODE=<deviceId> pnpm --filter @virtality/socket dev_sim

# Point at another server (defaults to http://localhost:8081)
SOCKET_URL=http://localhost:8081 ROOM_CODE=<deviceId> pnpm --filter @virtality/socket dev_sim

# Never answer videoStop, to see the console's stop timeout
SIM_IGNORE_VIDEO_STOP=1 ROOM_CODE=<deviceId> pnpm --filter @virtality/socket dev_sim
```

The library starts empty. Any `videoId` downloads in about 10 s with progress
ticks; an id prefixed `fail-` answers `videoDownloadFailed { reason: 'unavailable' }`.
Timings live in `src/sim/simulated-headset.ts`.
