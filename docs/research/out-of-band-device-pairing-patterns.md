# Research: Out-of-band Device Pairing patterns without a pair room

**Ticket:** [Out-of-band Device Pairing patterns without a pair room](https://github.com/Virtality-app/virtality-platform/issues/21)  
**Map:** [Device Pairing redesign path](https://github.com/Virtality-app/virtality-platform/issues/19)  
**Question:** What credible patterns exist for binding a headset identity to a clinician Device **without** using a temporary Socket.IO pair room (server-mediated pair session, QR/code exchanged out-of-band, authenticated claim APIs, etc.), and what trade-offs do they have for reliability, simplicity, ease of use, and VR coordination?  
**Sources:** In-repo Device / socket pairing code; RFC 8628; Google OAuth limited-input device docs; Matter Core Specification (CSA) commissioning; AWS IoT fleet provisioning; Azure IoT Hub Device Provisioning Service.  
**Branch:** `research/out-of-band-device-pairing`

## Verdict

Credible out-of-band bind patterns all share the same shape: **exchange a short-lived secret outside the live treatment channel, then complete an authenticated server-side claim that writes a durable headset identity onto `Device.deviceId`**. None of them need a temporary Socket.IO pair room for the bind itself.

For Virtality’s constraints (external VR client, clinician-owned `Device`, prefer one owner per headset identity, separate pairing from socket communication), the strongest fit is a **console-initiated authenticated claim session + HTTP claim API**, with UX variants of:

1. **Console shows code / QR** (clinician-initiated; headset enters or scans), or
2. **Headset shows code / QR** (RFC 8628 device-flow shape; clinician confirms in console).

Both keep sockets for **post-pair treatment rooms only**. Matter’s OOB onboarding payload and AWS “trusted user” temporary claim are the closest industrial analogues; full Matter PASE/BLE commissioning and Azure DPS factory enrollment are useful references but heavier than this product needs.

---

## Primary sources

| Source                                                                                                                                                                    | Role                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [RFC 8628: OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628)                                                                                  | Canonical limited-input device + secondary-device confirmation / polling pattern                                                          |
| [Google: OAuth 2.0 for TV and Limited-Input Device Applications](https://developers.google.com/identity/protocols/oauth2/limited-input-device)                            | First-party implementation of RFC 8628 (device shows `user_code`, rich client authorizes, device polls)                                   |
| [Matter Core Specification 1.4, Chapter 5 Commissioning](https://csa-iot.org/wp-content/uploads/2025/01/23-27349-006_matter-1-4-core-specification.pdf?ver=1762803058)    | OOB onboarding payload via QR / manual pairing code / NFC; passcode used for PASE; commissioning separate from later operational sessions |
| [AWS IoT: Provisioning without device certificates (fleet provisioning)](https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html)                    | Provisioning by claim vs **trusted user** temporary claim (`CreateProvisioningClaim`, short TTL)                                          |
| [Azure DPS overview](https://learn.microsoft.com/en-us/azure/iot-dps/about-iot-dps) + [DPS terminology](https://learn.microsoft.com/en-us/azure/iot-dps/concepts-service) | Enrollment list, attestation, registration ID → durable device ID; provision separate from later hub messaging                            |
| In-repo: `Device` model, `setDeviceId` / `findByDeviceId`, console pair UX, socket `SendDeviceId`                                                                         | Current bind path and constraints                                                                                                         |

---

## Repo constraints (current bind path)

### Data model

`Device` (`packages/db/console/prisma/models/assets.prisma`) is clinician-owned (`userId`) with optional `deviceId: String?`. There is **no DB unique constraint** on `deviceId` today. Soft-delete uses `deletedAt`.

### Pairing today couples identity bind to a Socket.IO room

1. Clinician starts pair on a console Device card (`use-device-card-state` → `startPairing`).
2. Console generates a 6-digit code (`progressiveRetry` / Redis) and sets it as the socket `roomCode`.
3. Console connects to the socket with that room code; VR is expected to join the same room.
4. VR emits `SendDeviceId` with a payload string; console persists via authenticated `device.setDeviceId`, acks, then disconnects the pair socket (`device-card.tsx`).
5. Later treatment / presence reuses `device.data.deviceId` as the room code (`setDeviceRoomCode(device.data.deviceId)`).

So **`deviceId` currently doubles as durable headset identity and as the live room address**. Map #19’s standing preference is to split those: pairing only establishes ownership / `deviceId`; sockets stay for communication after pair.

### APIs already half-support an out-of-band bind

- Authenticated `POST /device/set-device-id` writes `deviceId` for a Device the clinician owns (`packages/orpc/src/procedures/device.ts`).
- Unauthenticated `findByDeviceId` and legacy `GET /api/v1/devices/:deviceId` look up by headset identity (no uniqueness enforcement in the write path).
- Pair success today still **requires** both peers in a temporary room so the VR can deliver the identity over the socket event bus (`DEVICE_EVENT.SendDeviceId`).

Pain called out in map #19 (code shown but headset never joins; pair looks OK then later connect fails; stale pair-room connections) is exactly what you get when **bind success depends on ephemeral room presence**.

### External VR

The VR client is outside this repo. Any chosen pattern may need a coordinated VR change (enter code, scan QR, poll claim status, or POST claim). That is allowed by the map; session launch / casting stay out of scope.

---

## Pattern A: RFC 8628-shaped device authorization (headset shows code)

### How it works (primary)

RFC 8628 / Google limited-input flow:

1. Constrained device requests codes from a **device authorization endpoint**.
2. Server returns `device_code` (for polling), `user_code` (for humans), `verification_uri` / optional complete URI, `expires_in`, `interval`.
3. Device displays `user_code` (+ URI / QR of complete URI).
4. User authenticates on a secondary device and confirms.
5. Constrained device **polls** the token endpoint until authorized, denied, or expired.

Google’s first-party docs match this: device POSTs for codes, shows `user_code`, polls with `grant_type=urn:ietf:params:oauth:grant-type:device_code`.

### Virtality mapping

| RFC 8628 role        | Virtality analogue                                            |
| -------------------- | ------------------------------------------------------------- |
| Limited-input client | VR headset                                                    |
| Secondary user agent | Clinician console (already authenticated)                     |
| Access token grant   | Durable bind: write headset identity → `Device.deviceId`      |
| Polling              | VR polls claim status / receives bind confirmation over HTTPS |

Headset starts a pending claim, shows a short `user_code` (and optional QR). Clinician opens console, enters/confirms the code against a chosen Device, server atomically binds. No pair room.

### Trade-offs

| Criterion       | Assessment                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Reliability     | High if claim is atomic + TTL’d + unique on `deviceId`. Failures are HTTP/poll timeouts, not “room never completed”.  |
| Simplicity      | Medium. Needs pending-claim store, poll endpoint, rate limits (RFC 8628 §5 on brute force). Console already has auth. |
| Ease of use     | Strong for VR: headset mostly displays; clinician types a short code on the rich UI. Familiar TV-login UX.            |
| VR coordination | Required: start claim, display code/QR, poll/complete. No socket join for pair.                                       |

### Fit notes

Best when the headset can show text/QR and make outbound HTTPS. Matches map pain: clinician confirmation does not depend on socket room membership.

---

## Pattern B: Console-initiated claim session + authenticated claim API (console shows code / QR)

### How it works

Industrial analogues:

- **AWS IoT provisioning by trusted user**: authenticated app calls `CreateProvisioningClaim` for a **temporary** claim credential (docs: expires in **five minutes**), delivers it to the device out-of-band (Wi-Fi config or similar), device registers and obtains a permanent identity, then reconnects with permanent credentials.
- **Matter onboarding payload**: commissioner obtains OOB secret from QR / manual pairing code / NFC; that secret bootstraps commissioning. Matter then uses local PASE; Virtality can keep the **OOB payload** idea and complete the bind via HTTPS instead of BLE/IP PASE.

Virtality shape:

1. Authenticated clinician selects Device → `POST /pair-sessions` → server creates short-lived `pairCode` (and optional signed QR payload) bound to `Device.id` + clinician.
2. Console displays code / QR (same surface as today’s pair card, without opening a socket).
3. Headset submits `{ pairCode, headsetIdentity }` to an unauthenticated-or-lightly-attested **claim** HTTP API.
4. Server validates TTL/rate limits, enforces **one owner per headset identity**, writes `deviceId`, returns success.
5. Console learns completion via poll, SSE, or existing query invalidation (not via pair-room `SendDeviceId`).

### Trade-offs

| Criterion       | Assessment                                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reliability     | High. Bind is a single transactional write. No “both peers must be in room” race. AWS trusted-user pattern explicitly uses short TTL to bound risk.                           |
| Simplicity      | Highest among credible options for this codebase: closest to today’s UX (console shows code) while removing socket from the bind. Reuses clinician auth for session creation. |
| Ease of use     | High if headset can enter 6-digit code or scan QR. Typing on Quest is worse than clinician typing; QR scan is better if VR can scan or clinician’s phone bridges.             |
| VR coordination | Required but narrow: claim HTTP call (+ optional QR decode). Can keep displaying a code like today.                                                                           |

### Fit notes

Closest drop-in replacement for the current clinician UX while satisfying “pairing ≠ socket room”. Strong default for the ADR unless Quest input makes headset-shown codes (Pattern A) clearly easier.

---

## Pattern C: Matter-style OOB onboarding payload (QR / manual code as the secret)

### How it works (primary)

Matter Core Spec Chapter 5:

- **Onboarding payload** carries what is needed to start commissioning (including setup passcode / discriminator).
- Delivered OOB via **QR code**, **manual pairing code**, or **NFC**.
- Commissioner uses the OOB passcode for **PASE**; later operational traffic uses **CASE** on the fabric. Spec text separates discovery + OOB secret from later secure operational sessions.

### Virtality mapping

Do **not** need Matter stacks or BLE. Borrow:

- Headset (or console) presents a structured payload: claim URL + nonce + optional headset identity hint.
- Other party scans / types.
- Server completes authenticated bind.

QR vs manual code is a UX choice Matter already treats as first-class (manual always required in Matter ecosystems; QR recommended).

### Trade-offs

| Criterion       | Assessment                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Reliability     | Same as A/B once claim is server-side; Matter’s local radio steps are irrelevant if both sides have internet.           |
| Simplicity      | Medium. Payload format + QR encoding is extra surface; full Matter commissioning would be overkill.                     |
| Ease of use     | Excellent with QR; manual code is the fallback (Matter’s lesson).                                                       |
| VR coordination | Depends who presents the QR. Headset-presented QR needs VR UI; console-presented QR needs headset camera or typed code. |

### Fit notes

Treat as **UX/encoding layer** on top of Pattern A or B, not a separate backend architecture.

---

## Pattern D: Fleet / enrollment-list provisioning (AWS claim cert, Azure DPS)

### How it works (primary)

- **AWS provisioning by claim**: shared claim cert embedded at manufacture; device exchanges it for a unique permanent certificate and registers via template.
- **Azure DPS**: manufacturing + cloud enrollment list; device attests (X.509 / TPM / symmetric key), DPS registers a durable device ID to a hub. Messaging to the hub is separate from the provisioning step.

### Virtality mapping

Useful when headsets are known ahead of time (serial / cert / registration ID) and clinicians are assigned pre-enrolled identities. Poor fit for ad-hoc Quest apps that mint or discover identity at first pair without a factory enrollment step.

### Trade-offs

| Criterion       | Assessment                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Reliability     | Very high for fleets with hardware identity; uniqueness and attestation are the point.                                      |
| Simplicity      | Low for Virtality near-term: needs enrollment ops, cert/key distribution, and VR identity story beyond a string `deviceId`. |
| Ease of use     | Clinician UX can be “select enrolled headset”, but ops cost moves to provisioning.                                          |
| VR coordination | Significant if introducing real attestation; over-scoped vs map’s Device Pairing ADR.                                       |

### Fit notes

Keep as a **future hardening** path (attested headset identity), not the first redesign. The lesson to take now: **provision/bind once, then communicate on a different channel** (DPS → hub; Matter commission → CASE; AWS claim → permanent cert).

---

## Cross-cutting design rules (from primary sources + repo)

1. **Separate bind from live communication.** Matter (PASE vs CASE), AWS (temporary claim session vs permanent cert reconnect), Azure DPS (provision then hub messaging), and map #19 all agree.
2. **Short-lived OOB secrets.** RFC 8628 `expires_in`; AWS temporary claim ~5 minutes; console already uses a countdown (~300s) during pair.
3. **Rate-limit / entropy on human codes.** RFC 8628 §5.1–5.2 (user/device code brute force); prefer short high-entropy codes + lockout over relying on room obscurity.
4. **One owner per headset identity.** Prefer a unique constraint (or transactional claim that clears/rejects collisions) on `Device.deviceId` among non-deleted rows. Today’s schema does not enforce this.
5. **Do not use the pair code as the durable `deviceId`.** Today the pair room code and durable identity are entangled via room addressing; after split, room keys for treatment should be derived from ownership, not from the OOB secret.
6. **Completion signal without a pair room.** Poll (RFC 8628), console query invalidation, or server push; avoid requiring simultaneous socket presence to finish the bind.

---

## Comparison (eval criteria from map #19)

| Pattern                                    | Reliability                                  | Simplicity                         | Ease of use                             | VR coordination              | Pair-room needed? |
| ------------------------------------------ | -------------------------------------------- | ---------------------------------- | --------------------------------------- | ---------------------------- | ----------------- |
| **A. Headset shows code (RFC 8628 shape)** | High                                         | Medium                             | High for VR; clinician types on console | Start claim + poll           | No                |
| **B. Console shows code/QR + HTTP claim**  | High                                         | High (closest to today)            | High if QR or easy headset entry        | Claim POST (+ optional scan) | No                |
| **C. Matter-style OOB payload encoding**   | High (with A/B backend)                      | Medium                             | High with QR                            | Who presents/scans           | No                |
| **D. Fleet enrollment / attestation**      | Highest for fleets                           | Low near-term                      | Ops-heavy                               | Large if attested            | No                |
| **Status quo: Socket.IO pair room**        | Weak for bind (room join races, stale peers) | Medium locally, fragile end-to-end | Familiar but brittle                    | Room join + `SendDeviceId`   | **Yes**           |

---

## Recommendation for the Device Pairing ADR

1. **Adopt Pattern B as the default architecture**: authenticated console-created pair session + headset HTTP claim that writes `Device.deviceId`, with TTL, rate limits, and uniqueness.
2. **Choose UX (code vs QR; who displays)** in a follow-on decision; Pattern C is the encoding, Pattern A is the reverse display direction if Quest entry is too painful.
3. **Keep sockets out of pairing**; after bind, treatment rooms address by durable identity (or a derived room key), not by the ephemeral pair code.
4. **Defer Pattern D** (certs / DPS-style enrollment) until headset attestation is a product requirement.
5. Coordinated VR change is required for any of A–C; scope it to claim UX + HTTPS, not session launch or casting.

This research does **not** pick final UX copy or room-key shape after the split; those remain in map #19 “Not yet specified.”
