# Session 021 — Milestone 3 Rules Boundary

| Field        | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Date         | 2026-08-24                                             |
| Milestone    | M3.1 — Chess Rules Boundary and Compatibility Evidence |
| Participants | Yasmany (decision owner), Codex (implementation)       |
| Status       | Completed                                              |

## Goal

Establish a replaceable, server-owned standard-chess rules boundary before any player move can be persisted or rendered as authoritative.

## Decisions Applied

- The project pins `chess.js` at `1.4.0` in the server workspace.
- Only `ChessJsRulesAdapter` imports `chess.js`; all outward types are owned by the project in `ChessRulesPort`.
- The adapter exposes standard representations and facts: FEN, side to move, legal destinations, move intent, accepted SAN moves, PGN export, and explicit termination-policy facts.
- Threefold repetition and the fifty-move rule are represented as claimable. Fivefold repetition and the seventy-five-move threshold are represented as automatic. The adapter intentionally avoids a generic library “draw” result.

## Implementation Evidence

- `apps/server/src/game/domain/chess-rules-port.ts`
- `apps/server/src/game/infrastructure/chess-js-rules-adapter.ts`
- `apps/server/src/game/infrastructure/chess-js-rules-adapter.test.ts`
- `apps/server/src/game/architecture/chess-library-boundary.test.ts`
- `.dependency-cruiser.cjs`
- `docs/ai/experiments/EXP-0004-chess-library-boundary.md`

The test fixtures cover a normal move, illegal move rejection, FEN reconstruction, SAN, PGN, checkmate, stalemate, castling, en passant, promotion, legal destinations, threefold/fivefold repetition, and fifty/seventy-five-move thresholds.

## Validation

Executed in the project Node 24 container:

```text
pnpm --filter @chess-ai/server typecheck
pnpm --filter @chess-ai/server test
pnpm architecture
```

Result: type checking passed; 14 unit tests passed; dependency-cruiser reported no violations.

## AI Contribution and Review

Codex proposed and implemented the port, adapter, reference fixtures, and architecture guard. A TypeScript validation failure identified that the selected `chess.js` API exposes kingside/queenside castling predicates rather than a single castle predicate; the adapter was corrected before acceptance. The implementation is ready for human review through the accepted M3 plan.
