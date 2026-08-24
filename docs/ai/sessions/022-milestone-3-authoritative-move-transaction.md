# Session 022 — Milestone 3 Authoritative Move Transaction

| Field        | Value                                            |
| ------------ | ------------------------------------------------ |
| Date         | 2026-08-24                                       |
| Milestone    | M3.2 — Authoritative Move Transaction            |
| Participants | Yasmany (decision owner), Codex (implementation) |
| Status       | Completed                                        |

## Goal

Persist a legal standard-chess move through one server-owned transaction, with player authorization, turn and version checks, a project-owned rules adapter, and an ordered history entry.

## Delivered Changes

- Added `current_fen`, `side_to_move`, and `version` to active games through migration `202608240001_authoritative_game_state`.
- Added the `game_moves` table. It keeps a sequence number, command identifier, player identity, source/destination, promotion, SAN, and both FEN boundaries.
- Added `submitAuthoritativeMove`, which locks the active game row, verifies player participation, checks duplicate commands, checks the expected version and turn, delegates legality to `ChessRulesPort`, and commits the move plus next state in one transaction.
- Added `POST /games/:gameId/moves`, protected by the temporary session cookie and Zod validation. It returns only stable public error codes for malformed, unauthorized, stale, duplicate, out-of-turn, and illegal commands.
- Extended `GET /games/:gameId` with confirmed board state, version, and ordered move history.
- Added the non-authoritative `game.updated` notification. Clients must refetch confirmed state; the notification is not a source of authority.

## Validation Evidence

`submit-authoritative-move.integration.test.ts` starts a PostgreSQL 18 container, applies every migration, seeds an active game, and proves:

1. White's legal `e2-e4` command commits one move with SAN `e4`, version `1`, and Black to move.
2. Reusing the same command identifier is rejected as `MOVE_COMMAND_DUPLICATE`.
3. A command for version `0` after the accepted transition is rejected as `MOVE_STALE`.
4. White cannot make a second move while Black is to move (`MOVE_NOT_YOUR_TURN`).
5. Exactly one database move record exists.

Executed successfully in containers:

```text
pnpm --filter @chess-ai/server typecheck
pnpm --filter @chess-ai/server test
pnpm architecture
pnpm --filter @chess-ai/server test:integration
```

## Deferred Work

- The M3.3 browser work will render confirmed FEN, send move commands, and refetch after `game.updated`.
- Durable replay of a prior accepted command response and broader reconnection recovery remain M4 hardening work. M3.2 currently rejects duplicate command identifiers safely.

## AI Contribution and Human Governance

Codex implemented the migration, transaction, HTTP contract, notification, and isolated PostgreSQL proof. The scope follows the approved M3 plan; no new product decision was introduced.
