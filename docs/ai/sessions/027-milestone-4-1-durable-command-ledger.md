# Session 027 — Milestone 4.1 Durable Command Ledger

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date         | 2026-08-25                                                 |
| Milestone    | M4.1 — Durable Command and Event Records                   |
| Participants | Yasmany (decision owner), Codex (implementation assistant) |
| Status       | Completed                                                  |

## Objective

Make confirmed player commands safe to retry and make the intent to notify connected clients durable with each game-state transition.

## Implementation

- Added `game_command_ledger`, keyed by game and client command ID. It persists the public confirmed response for move and lifecycle-action commands.
- Added `game_outbox`, which persists a `game.updated` notification intent in the same transaction as a confirmed move, game action, or server-detected clock timeout.
- Repeating a confirmed move or action command returns its original result instead of applying a second transition.
- Added a command ID to lifecycle-action requests so actions have the same retry contract as moves.
- Applied the migration to the local containerized development database.

## Validation Evidence

- Server TypeScript check: passed.
- Web TypeScript check: passed.
- Integration suite: passed, 2 files and 4 tests.
- The integration tests verify one persisted move for a repeated command, the stored command response, and durable outbox records for moves, actions, and clock expiry.

## Boundary for the Next Slice

M4.1 stores delivery intent but retains the existing immediate Socket.IO notification path. M4.2 will introduce the independent, retry-safe dispatcher that consumes pending outbox records. Until then, the outbox is deliberately not marked delivered.

## Decisions Applied

- M4-D02: same command ID returns the original confirmed result.
- M4-D03: state transition and delivery intent commit atomically.

## Next Step

Implement M4.2: lease-based outbox dispatch with retry and backoff.
