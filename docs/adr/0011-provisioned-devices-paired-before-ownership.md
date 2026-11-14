# Provisioned Devices: headsets paired before the customer has an account

**Status:** accepted

We want to pair a VR headset in-house before we ship it, so the customer signs up and finds it already paired and ready. Under ADR 0004 a headset binds to a Device, and every Device needs an owner (`Device.userId`). Before sign-up there is no user to own it. We decided to let a Device exist without an owner while it is linked to an **Access Code**. Redeeming the code gives the Device its owner. We call this a **Provisioned Device**.

This extends ADR 0004 and does not replace it. The claim protocol, the one-owner rule and the unique `Device.deviceId` stay as they are. The headset never moves from one Device to another. Only the Device's owner changes, once, from nobody to the customer who redeems the code.

## Decision

1. **A Device may have no owner.** `Device.userId` becomes nullable. A Device with no owner must be linked to an Access Code or be held in staff inventory. Console queries already filter by `userId`, so no clinician sees these Devices.
2. **The link lives on the Device.** `Device.accessCodeId` points at the Access Code (`TrialRedeemCode`). One code can carry several Provisioned Devices, so a clinic order of three headsets is one code. An account can own any number of Devices, whatever their origin.
3. **Staff pair through the normal claim.** Staff create the Provisioned Device in Adminboard and start a **Pairing Claim** there. The VR claims with the same 6-digit code and REST route as in ADR 0004. `DevicePairingAttempt.userId` records the staff member who started the claim. The claim accepts a target Device with no owner.
4. **Redemption sets the owner.** When a code is marked used, every Provisioned Device linked to it gets `userId` set to the redeeming user, in the same transaction. Both redemption paths do this: sign-up and Profile → Billing. It happens for every outcome that marks the code used, including "already entitled". The code's mode (Free or Trial) does not matter. Staff decide who gets a headset, and ADR 0007 still decides whether that account may launch VR.
5. **The code and the box travel separately.** The customer may redeem the code before the headset arrives. The Device then shows in their console as paired, and it comes online when the headset first connects.
6. **An expired code doesn't strand the headset.** Unused Access Codes still expire after one week. While a Provisioned Device has no owner, staff can move it to another code or detach it to inventory. The headset stays paired the whole time. Once a customer owns the Device, staff can't move it. The customer uses **Unpair** or **Device Removal** as with any other Device.
7. **Nothing changes for existing Devices.** Devices that already have an owner keep it. No data migrates.

## Rejected alternatives

| Alternative                                                                    | Why rejected                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pair under an internal "inventory" staff account, then transfer                | A real account would own customer hardware. It could see those headsets and run sessions on them, and a transfer between two real users is a broader action than we need.      |
| Store the Headset Identity on the Access Code, create the Device at redemption | No Device row means `Device.deviceId` uniqueness can't hold the headset, so it could be paired elsewhere while it waits. The claim route would also need a second target type. |
| Link field on the Access Code (`TrialRedeemCode.deviceRecordId`)               | Allows only one headset per code, and moving a headset to a new code means editing two rows.                                                                                   |

## Consequences

- No VR change is needed for the bind itself. The registration check returns `paired: true` for a Provisioned Device, so the headset boots ready. The legacy `GET /api/v1/devices/:deviceId` route returns the Device row, which can now have `userId: null`. The VR build must tolerate that.
- Nobody can run a session or write a **Library Mirror** for a Provisioned Device until a customer owns it, because those calls are scoped to the owner.
- The `headset_paired` analytics event uses the owner as its distinct id. For a Provisioned Device it fires when the customer receives ownership, not when staff pair it.
- Implementation spec: #403.
