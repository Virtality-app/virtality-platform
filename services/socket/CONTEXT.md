# Socket

Real-time bridge between the console frontend and VR headsets during treatment workflows.

## Language

**Room Peer Role**:
The side of a treatment room connection occupied by a real-time peer. The canonical roles are `console` and `vr`.
_Avoid_: Agent, client, generic room member

**Role Slot**:
The single room position reserved for one **Room Peer Role**. A room has one `console` slot and one `vr` slot.
_Avoid_: First member, second member, room capacity count

**Active Role Peer**:
The current peer occupying a **Role Slot**. When a new peer connects for the same **Room Peer Role**, it becomes the **Active Role Peer** for that slot.
_Avoid_: Duplicate peer, stale member, old instance

**Role Peer Replacement**:
A new peer taking over an occupied **Role Slot** for the same **Room Peer Role**. It applies to both `console` and `vr`, and is not treated as the previous peer leaving the room.
_Avoid_: Member left, extra member, room full retry

**Replacement Notice**:
A message sent to the previous **Active Role Peer** when a **Role Peer Replacement** occurs.
_Avoid_: Generic disconnect, silent replacement
