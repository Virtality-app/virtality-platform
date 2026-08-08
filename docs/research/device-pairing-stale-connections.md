# Research: How Device Pairing rooms create stale connections

**Ticket:** [How Device Pairing rooms create stale connections](https://github.com/Virtality-app/virtality-platform/issues/20)  
**Map:** [Device Pairing redesign path](https://github.com/Virtality-app/virtality-platform/issues/19)  
**Question:** How does the current Device Pairing flow (console generates a 6-digit code, connects to a Socket.IO room as that code, headset joins the same room, sends `deviceId`, console persists and acks, both disconnect) create or leave stale connections / stale role-slot peers, and which concrete failure modes follow from that for later treatment connect?  
**Sources:** In-repo console pair UI, Redis code reservation, socket role-slot registry, disconnect/replacement/presence paths (VR client is outside this repo).  
**Branch:** `research/pairing-stale-connections`

## Verdict

Pairing and treatment share the same Socket.IO **Role Slot** room machinery. Pairing keys the room by an ephemeral 6-digit Redis-reserved code; treatment later keys the room by the persisted headset `deviceId`. Stale peers are created whenever a Role Slot is occupied and the occupant’s disconnect does not clear that slot (asymmetric leave, delayed console disconnect, dead TCP without `disconnect`, or a replaced peer’s late disconnect being ignored by design).

The highest-impact pairing-specific mechanisms are:

1. **Redis code TTL (5 min) is much shorter than in-memory room TTL (5 h)**, so a recycled pair code can join a room that still holds a ghost **Active Role Peer**.
2. **Room deletion only happens when both Role Slots are empty** (or after room TTL eviction), so one-sided leave after pair leaves a half-occupied pair room.
3. **Console client state after pair** can remain connected to the pair-code room (or keep `query.roomCode` set to the pair code) until treatment explicitly overwrites and reconnects, so the first treatment “Connect” can target the wrong room or no-op as already connected.

Leftover pair-code rooms do **not** automatically occupy the later `deviceId` treatment room, but they do create wrong-peer / premature-complete pairing outcomes and console socket state that make later treatment connect fail or look connected while relays never reach the headset.

---

## Primary sources

| Source                                                        | Role                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/console/hooks/use-device-card-state.tsx`                | Pair start: generate code, set `roomCode`, connect                          |
| `apps/console/app/(app)/devices/_components/device-card.tsx`  | Receive `SendDeviceId`, persist, ack, delayed disconnect                    |
| `apps/console/lib/utils.ts` + `apps/console/redis.ts`         | 6-digit code generation and Redis reservation TTL                           |
| `apps/console/hooks/use-device.ts` + `apps/console/socket.ts` | Per-device Socket.IO client; `query.roomCode` / `role: console`             |
| `apps/console/components/ui/vr-control-panel.tsx`             | Treatment connect uses persisted `deviceId` as `roomCode`                   |
| `apps/console/hooks/use-socket-connection.ts`                 | Connect gate, ReplacementNotice → fail + disable reconnect                  |
| `services/socket/src/domain/role-slot-room-registry.ts`       | Join, replace, stale disconnect ignore, room delete, TTL eviction, presence |
| `services/socket/src/sockets/device-event-controller.ts`      | Wire join/disconnect/replacement/relay authorization                        |
| `services/socket/CONTEXT.md`                                  | Ubiquitous language for Role Slot / Active Role Peer / Replacement          |
| `packages/shared/src/types/socket-events.ts`                  | Room complete / empty helpers; `DEVICE_RELAY` including `SendDeviceId`      |
| `packages/orpc/src/procedures/device.ts`                      | Persist `deviceId` on the Device row                                        |

---

## Current pairing flow (as implemented)

```text
Console                          Redis                     Socket registry              Headset (out of repo)
  |                                |                              |                           |
  | generateCode + keyExists/setKey|                              |                           |
  |------------------------------->| (EX 300s)                    |                           |
  | set query.roomCode = code      |                              |                           |
  | connect role=console ---------+------------------------------>| join console Role Slot    |
  | show code                      |                              |                           |
  |                                |                              |<-- join roomCode=code ----|
  |                                |                              | join vr Role Slot         |
  |                                |                              | RoomComplete if both set  |
  |<------------- relay SendDeviceId -----------------------------|----------- SendDeviceId --|
  | setDeviceId(deviceId) via oRPC |                              |                           |
  | SendDeviceIdAck --------------+------------------------------>|----------- ack ---------->|
  | setTimeout(disconnect, 1000) -+------------------------------>| clear console slot        |
  |                                |                              | (VR may or may not leave) |
```

Concrete console steps:

1. `progressiveRetry()` generates a zero-padded 6-digit code, rejects if Redis key exists, then `SET`s it with **5 minute** expiry (`apps/console/lib/utils.ts`, `apps/console/redis.ts`).
2. `setDeviceRoomCode(code)` writes `socket.io.opts.query.roomCode`, then `connect()` (`use-device-card-state.tsx`, `use-device.ts`).
3. Socket server requires `roomCode` + parsable `role`, then `joinRoleSlot` and `socket.join(roomCode)` (`device-event-controller.ts`).
4. When VR relays `SendDeviceId`, console persists via `setDeviceId` and on success emits `SendDeviceIdAck`, then **disconnects after 1 second** (`device-card.tsx`).
5. Cancel path only `socket.disconnect()`s the console; it does **not** delete the Redis key (`use-device-card-state.tsx` `cancelPairing`).

Treatment later uses a **different** room key:

- `vr-control-panel.tsx` calls `setDeviceRoomCode(deviceId)` then `connect()` for the selected paired Device.

So identity bind (`deviceId` in DB) and live room addressing are coupled through the same socket protocol, but pair-time and treatment-time `roomCode` values are intended to differ.

---

## How stale Role Slot peers are created

### Registry rules (server)

From `role-slot-room-registry.ts` and `services/socket/CONTEXT.md`:

- Each room has exactly one **console** Role Slot and one **vr** Role Slot.
- `joinRoleSlot` always installs the new socket id as the **Active Role Peer**. If the slot was occupied, the outcome is `role_peer_replaced` (not “room full”).
- `disconnectRolePeer` clears the slot **only if** `peerSocketId` still matches the Active Role Peer. Otherwise it returns `stale_disconnect_ignored` and leaves the active peer untouched (covered by unit + integration tests).
- The in-memory room is deleted only when **both** slots are empty after a clearing disconnect, or via `evictStaleRooms` when age exceeds **5 hours** (`DEFAULT_ROOM_TTL_MS`) / empty. Cleanup interval: **30 minutes** (`device-event-controller.ts`).

Replacement disconnects the replaced Socket.IO socket and emits `ReplacementNotice`; that disconnect’s registry effect is intentionally ignored if it races after the new peer is already active.

### Pairing paths that leave occupancy

| Mechanism                                        | What stays behind                                                                               | Evidence                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Console leaves, VR stays                         | VR Role Slot occupied under **pair code**; room not deleted                                     | Console delayed/cancel disconnect only clears console slot; room delete requires both empty                         |
| VR never joins; console cancels/times out        | Usually empty → room deleted; if console disconnect never reaches server, console ghost remains | `disconnectRolePeer` / connect timeout `socket.disconnect()` in `use-socket-connection.ts`                          |
| Dead TCP / process kill without clean disconnect | Active Role Peer socket id remains until TTL eviction                                           | No heartbeat-based slot clear in registry; only disconnect handler + 5h TTL                                         |
| Role Peer Replacement                            | Old peer is stale relative to the slot; its late disconnect is ignored                          | `stale_disconnect_ignored`; tests in `role-slot-room.test.ts` / registry tests                                      |
| Console Socket.IO reconnect during pair          | New socket id joins same pair code → replaces prior console Active Role Peer                    | `joinRoleSlot` replacement; console UI then treats `ReplacementNotice` as hard failure (`use-socket-connection.ts`) |

Redis reservation does **not** clear socket rooms: there is no `deleteKey` on successful pair or cancel. Redis only gates “is this code currently reserved?” for ~5 minutes.

---

## Pair-code reuse vs room lifetime (critical coupling)

| Layer                    | Key                       | Lifetime                                                          |
| ------------------------ | ------------------------- | ----------------------------------------------------------------- |
| Redis pair reservation   | 6-digit code              | **5 minutes** (`setKey` default `ttl = 5 * 60`)                   |
| In-memory Role Slot room | same string as `roomCode` | Until both slots empty, or **5 hours** TTL eviction               |
| UI countdown             | display only              | 300s; **does not auto-cancel** when it hits 0 (`device-card.tsx`) |

After Redis expiry, `progressiveRetry` may hand out the **same** 6-digit code again while an old room still exists in the registry with a ghost VR (or console) peer. The new join does not create a fresh empty room; it attaches to the existing Map entry (`getOrCreateRoom`).

Concrete pairing failure from that:

- New console joins a room that still has a stale VR Active Role Peer → `roomComplete` becomes true immediately (`isRoomComplete`), `RoomComplete` is emitted, presence/device-status look “active”, but the peer may be the wrong headset or a dead socket that never re-sends `SendDeviceId`.
- New VR joins while a stale VR occupies the slot → replacement (correct for the new headset), but any console already talking to the old peer saw a disrupted session.
- Relays from a replaced peer are blocked (`authorizeRelay` → `not_active_role_peer`); tests show replaced VR cannot deliver `SendDeviceId` / program / casting events.

---

## Console client state after “successful” pair

After `setDeviceId` success (`device-card.tsx`):

1. Ack is sent on the **current** socket (still in the pair-code room).
2. Disconnect is scheduled **1 second later**, not immediately.
3. `mutations.setDeviceRoomCode` is **not** updated to the new `deviceId`; `query.roomCode` remains the pair code until something else overwrites it.
4. `useSocketConnection.connect` **returns early if `socket.connected`** without changing rooms.

Treatment connect (`vr-control-panel.tsx`) only sets `deviceId` as `roomCode` when `!connected`. If the pair socket is still connected (delay window, disconnect failure, or reconnect), the Connect control takes the `else` branch and **disconnects** instead of joining the treatment room.

`ReplacementNotice` handling disables Socket.IO reconnection and marks connection `failed`. A clinician can still have persisted `deviceId` from a prior partial success while the console socket is left in a failed, non-reconnecting state until a full remount / new socket from `useDevice`’s device list effect.

---

## Failure modes for later treatment connect

Treatment room key = persisted `deviceId` (`vr-control-panel.tsx`). Pair-code leftovers do not occupy that Map key by themselves. Failures that still follow from the pairing design:

### 1. Wrong-room / already-connected console socket

**Cause:** Pair socket still connected (or UI believes it is) with `query.roomCode` = pair code.  
**Symptom:** First treatment Connect no-ops as toggle-off, or clinician appears connected without a `deviceId` room peer; program relays never reach the headset.  
**Recovery:** Manual disconnect then Connect (sets `deviceId` and reconnects), or device list remount creating a fresh socket.

### 2. Headset still sitting in the pair-code room

**Cause:** Console cleared its pair Role Slot after ack; VR client (out of repo) did not leave the pair room / did not join `deviceId`.  
**Symptom:** Pair UI already shows Paired (`deviceId` in DB). Treatment presence for that `deviceId` is false (`getVrPresence` only checks the VR slot of the **queried** room codes). Console can join the treatment room alone; `DEVICE_STATUS` stays `inactive` until a VR joins; no useful peer for session start.  
**Note:** This is the “pair looks successful then later connect fails” map pain, as seen from console sources alone.

### 3. Premature bind from stale VR on a recycled pair code

**Cause:** Redis allows reuse while registry still holds an old VR under that code; new console gets immediate `RoomComplete` with the ghost peer; `SendDeviceId` may be absent, stale, or from the wrong headset.  
**Symptom:** Pair hangs despite “room complete”, or DB `deviceId` binds to the wrong durable id. Later treatment connects to a room the intended headset is not using.  
**Evidence chain:** Redis 5 min vs room 5 h; `getOrCreateRoom`; `isRoomComplete` / `RoomComplete` emit; oRPC `setDeviceId` trusts whatever string was relayed.

### 4. Replacement during pair leaves console unable to reconnect cleanly

**Cause:** Second console tab, retry, or Socket.IO reconnect replaces the Active Role Peer; UI disables reconnection on `ReplacementNotice`.  
**Symptom:** Pair aborted or flaky; if `deviceId` was already written, Device shows paired but this tab’s socket is `failed` until remount. Treatment from that tab fails until a healthy connect path runs.

### 5. Ghost Active Role Peer in the **treatment** room (same machinery, post-pair)

Not unique to the pair-code string, but the same registry policy applies once both sides use `deviceId` as `roomCode`:

- Dead VR still occupying the VR slot → presence reports online for that `deviceId`, `getDeviceStatus` becomes `active` as soon as console joins, `RoomComplete` fires, but relays target a dead socket id until a new VR replaces the slot.
- Stale replaced peers cannot relay (by design); if the “live” peer is wrong, treatment looks connected and silent.

Map issue #19 already notes treatment-time staleness may remain even after pair-rooms are removed; pairing today exercises the same Role Slot semantics under a short-lived code, which seeds clinician-visible “connected but dead” behavior.

### 6. What does _not_ directly block treatment

- An orphaned pair-code room with no code reuse does not reserve the `deviceId` room key.
- Redis keys alone do not keep Socket.IO peers alive (they only collide codes while present).
- `stale_disconnect_ignored` correctly protects the **new** Active Role Peer after replacement; it is not itself a treatment bug, but it means cleanup must come from the active peer’s disconnect or TTL, not from the replaced peer leaving.

---

## Implications for the Device Pairing redesign (map #19)

Standing map preference is to separate **Device Pairing** (durable `deviceId` / ownership bind) from Socket.IO rooms used for live communication. Primary-source behavior above supports that split:

- Pairing currently **must** occupy Role Slots to relay `SendDeviceId`, so every pair attempt is also a room lifecycle that can leave stale peers.
- Treatment addressing reuses the same registry under a different key (`deviceId`), inheriting replacement / ghost / presence semantics.
- Even a perfect “both disconnect after ack” happy path still races the 1s delayed console disconnect and depends on out-of-repo VR leave behavior.

Out of scope for this ticket: recommending the ADR option. This note only pins how stale connections arise and which treatment-connect failures follow.

---

## Gaps / outside this repo

- VR headset join/leave/ack handling after `SendDeviceIdAck` is not in this repository; failure mode (2) assumes VR may remain in the pair room or fail to join `deviceId`.
- No in-repo guarantee that headset `deviceId` never equals a 6-digit pair code (oRPC stores an opaque string). Collision would merge pair and treatment room keys; not evidenced here, but the protocol allows it.
