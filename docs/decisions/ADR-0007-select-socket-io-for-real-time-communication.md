# ADR-0007: Select Socket.IO for Real-Time Communication

## Metadata

| Field             | Value                                      |
| ----------------- | ------------------------------------------ |
| Status            | Accepted, subject to validation            |
| Date              | 2026-08-19                                 |
| Decision owner    | Yasmany                                    |
| AI contributor    | Codex                                      |
| Related session   | Session 008                                |
| Related decisions | ADR-0001, ADR-0002, ADR-0003, and ADR-0005 |

## Context

Active games require bidirectional communication for joining a game, submitting moves, receiving authoritative state changes, observing clocks, reconnecting, and completing game-ending actions. The transport must integrate with NestJS while preserving the server as the sole game authority.

NestJS supports Socket.IO and `ws` through official adapters. A lower-level `ws` solution would provide native WebSocket compatibility and a smaller protocol surface, but the application would need to implement more reconnection, acknowledgement, room, and message-routing behavior itself.

Yasmany is already familiar with Socket.IO.

## Decision

Use **Socket.IO** through the official NestJS Socket.IO platform adapter for active-game real-time communication.

Use the following transport split:

1. HTTP handles creating games, querying the public lobby, loading game history, and downloading PGN.
2. Socket.IO handles joining an active game, submitting moves, and receiving authoritative moves, state, clock, resignation, draw, and completion updates.

Begin with one application instance. Multi-instance Socket.IO adapters and additional infrastructure are deferred until scale or availability evidence requires them.

## Protocol and Authority Rules

1. Every state-changing client command carries a unique command identifier.
2. The server processes commands idempotently and returns an explicit accepted or rejected result.
3. The client cannot treat a local action, emitted command, or transport acknowledgement as an accepted chess action.
4. Authoritative game changes occur through application use cases and domain behavior, never inside the Socket.IO gateway.
5. PostgreSQL stores durable authoritative state; Socket.IO state is transient delivery state.
6. On connection or reconnection, the client obtains or verifies a complete authoritative snapshot.
7. Socket.IO connection-state recovery may optimize short interruptions but cannot replace application-level resynchronization.
8. Messages use versioned Zod-validated public contracts.
9. Transport rooms and socket identifiers cannot serve as player identity or authorization by themselves.
10. Server-to-client events include sufficient game version or sequence information to detect stale, duplicate, or missing state.

## Rationale

Socket.IO reduces initial delivery complexity by providing event-based messaging, acknowledgements, rooms, client reconnection behavior, and optional connection-state recovery. Its official NestJS integration fits the selected backend stack, and existing human familiarity reduces adoption risk.

The choice does not provide durable or exactly-once delivery. Application-level idempotency, persistence, sequence tracking, and snapshot resynchronization remain necessary.

## Consequences

### Positive

- Established integration with NestJS.
- Familiar technology for the human decision owner.
- Built-in event routing, acknowledgements, rooms, and reconnection support.
- A practical browser client library.
- Clear separation between asynchronous game delivery and resource-oriented HTTP operations.

### Negative

- Socket.IO uses its own protocol and is not interchangeable with a raw WebSocket client.
- Default arrival semantics do not guarantee that every event reaches its recipient.
- Connection recovery can fail and cannot be treated as authoritative recovery.
- Horizontal scaling will require additional adapter and routing decisions.
- Protocol convenience can encourage domain logic in gateways unless architecture rules are enforced.

## Required Validation

The real-time architecture experiment must demonstrate:

1. two browsers joining the same game;
2. accepted and rejected command acknowledgements;
3. duplicate command handling without duplicate moves;
4. ordered game version or sequence handling;
5. disconnection, reconnection, and authoritative snapshot synchronization;
6. server restart recovery from PostgreSQL;
7. clock behavior that does not trust client time;
8. Zod validation and safe protocol-error responses;
9. transport adapters calling application ports without domain dependencies on Socket.IO.

Failure of the experiment reopens the real-time library or protocol decision.

## Evidence

- NestJS officially supports Socket.IO and `ws` adapters for WebSocket gateways.
- Socket.IO documents ordered messages but at-most-once arrival by default.
- Socket.IO connection-state recovery can restore some sessions and missed packets, but its documentation requires applications to handle unsuccessful recovery and state synchronization.

Evidence was reviewed on 2026-08-19.

## AI Contribution

Codex compared the NestJS-supported Socket.IO and `ws` directions, recommended Socket.IO, and proposed the HTTP/real-time split and protocol safeguards.

## Human Approval

Yasmany approved Socket.IO and the proposed rules on 2026-08-19. He also recorded prior familiarity with Socket.IO.
