# Session 033 — Milestone 5.1 Archive Projection

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date         | 2026-08-26                                                 |
| Milestone    | M5.1 — Completed-Game Publication and Archive Projection  |
| Participants | Yasmany (decision owner), Codex (implementation assistant) |
| Status       | Completed                                                  |

## Objective

Create a durable, public, Archive-owned read model for every completed authoritative game without giving Archive direct access to Game storage.

## Implementation

- Added `completed_at` to the authoritative game record and Archive-owned `archived_games` and `archived_game_moves` projections.
- A terminal move, resignation, accepted draw, draw claim, or timeout now writes `game.completed` to the existing transactional outbox alongside `game.updated`.
- The outbox dispatcher delivers typed `game.updated` and `game.completed` facts. The latter invokes the idempotent Archive projector.
- Game exposes an explicit completed-game read contract to Archive; the projection includes public player names, game facts, initial/final FEN, result, termination reason, completion timestamp, and confirmed move data.
- Startup runs a repeatable backfill. It projects older completed games and uses their creation timestamp only when historical completion time was not recorded before M5.

## Validation Evidence

- Server TypeScript check: passed.
- Server lint: passed.
- Integration suite: passed, 2 files and 7 tests.
- A completed agreed-draw game produced a durable `game.completed` fact and an Archive projection with its players, result, and reason.
- Repeating the projection returned no duplicate, and the explicit backfill projected the earlier completed fixture.
- `git diff --check`: passed.

## Next Step

Implement M5.2: public archive discovery, filters, and deterministic replay.
