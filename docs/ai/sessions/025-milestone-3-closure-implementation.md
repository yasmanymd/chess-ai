# Session 025 — Milestone 3 Closure Implementation

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date         | 2026-08-25                                                 |
| Milestone    | M3.4–M3.5 — Clocks, completion, and player actions         |
| Participants | Yasmany (decision owner), Codex (implementation assistant) |
| Status       | Completed                                                  |

## Objective

Implement the remaining authoritative gameplay capabilities required to close Milestone 3 while preserving the server as the sole authority for clocks, results, and lifecycle transitions.

## Implemented Slice

- Added persisted white and black remaining time, turn start timestamp, game result, termination reason, and pending draw-offer state.
- Added an append-only `game_events` table for player lifecycle actions.
- Initialized `Rapid 10+0` and `Blitz 5+3` clocks when a waiting table becomes an active game.
- Calculated elapsed time inside the server-side move transaction, applied the Blitz increment only after an accepted move, and rejected a move after the active side has flagged.
- Completed a game on checkmate, stalemate, or insufficient material according to the rules adapter's confirmed position.
- Added authoritative resignation, draw offer, draw acceptance/rejection, and eligible claim-draw commands.
- Added browser clock rendering, explicit promotion selection, localized lifecycle controls, and confirmed completed-game messaging.
- Refined the game sidebar after human review: the player roster uses full-width rows with a color marker, display name, clock, and compact identity/turn badges.
- Added automatic lobby refresh through same-origin Socket.IO notifications, with a periodic fallback.
- Added an explicit route back to the lobby after a completed game and result wording that names the winning player instead of only the winning color.

## Decisions Applied

| ID     | Decision                                                                                                                  | Owner           | Status                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------ |
| M3-D04 | Clock elapsed time is calculated from a recorded server timestamp; browser timers are display-only estimates.             | Yasmany + Codex | Applied                  |
| M3-D05 | Player lifecycle commands create a persisted event in the same transaction as the game-state transition.                  | Yasmany + Codex | Applied                  |
| M3-D06 | Promotion remains a deliberate client choice; the browser sends the selected piece but never determines move legality.    | Yasmany + Codex | Applied                  |
| M3-D07 | A clock reaching zero ends a game without requiring a subsequent player action.                                           | Yasmany + Codex | Applied                  |
| M3-D08 | Player identity and turn state use compact badges in a full-width roster row rather than competing with the move columns. | Yasmany + Codex | Approved in human review |

## Validation Evidence

- Server TypeScript check passed.
- Web TypeScript check passed.
- Existing isolated PostgreSQL integration suite passed after the schema migration.
- Local database migration `202608250001_game_clocks_and_lifecycle` applied successfully.
- Added and passed integration coverage for autonomous timeout completion and an agreed-draw lifecycle event.
- Human review approved the current board, roster, clock, and result presentation.

## Remaining Before Closure

## Closure Evidence

- Two-player human validation confirmed authoritative board updates across browser contexts.
- Human validation confirmed that an active clock reaching zero automatically completes the game and presents the named winner to both players.
- The player confirmed the current visual presentation, mobile-capable interaction model, lobby updates, and completed-game return path.
- Remaining recovery, delivery, and command-idempotency hardening intentionally belongs to Milestone 4.

## Next Step

Begin Milestone 4 — Durability, Recovery, and Concurrency.

- Record the final M3 exit-validation session and update the milestone status after the evidence passes.
