# EXP-0004: Chess-Library Boundary

| Field            | Value                  |
| ---------------- | ---------------------- |
| Status           | Completed              |
| Owner            | AI implementation team |
| Decision owner   | Yasmany                |
| Related decision | ADR-0008               |

## Hypothesis

The selected chess library can remain behind a domain-facing adapter without leaking library-specific representations throughout transport, persistence, or UI contracts.

## Success Criteria

- Domain-facing contracts cover required legal moves, status, SAN, FEN, and PGN behavior.
- Contract and rules tests verify the adapter.
- Transport and UI do not depend directly on library-specific types.
- A representative fake or alternate implementation can satisfy the boundary in tests.

## Method

`chess.js` 1.4.0 was pinned in the server workspace. The implementation is isolated in `ChessJsRulesAdapter`, which is the only server source file that imports the library. All other code uses the project-owned `ChessRulesPort` types.

The adapter tests use fixed FEN positions and project-owned move intents to verify normal moves, illegal moves, FEN reconstruction, SAN, checkmate, stalemate, castling, en passant, promotion, legal-destination lookup, repetition, and fifty/seventy-five-move thresholds.

## Results

- The adapter returns only project-owned colors, pieces, moves, positions, and status facts.
- The adapter does not use `chess.js` generic draw/game-over helpers. It preserves the project's distinction between claim-based threefold/fifty-move rules and automatic fivefold/seventy-five-move rules.
- Repetition is evaluated from a replayed move sequence because a FEN alone does not encode position history.
- `dependency-cruiser` prohibits direct `chess.js` imports outside the adapter, and the architecture test below makes the rule independently visible in the server test suite.

## Evidence

- `apps/server/src/game/infrastructure/chess-js-rules-adapter.test.ts`
- `.dependency-cruiser.cjs`
- `apps/server/src/game/architecture/chess-library-boundary.test.ts`

## Limitations Carried Forward

- M3.1 validates the rules boundary only; it does not persist moves or authorize commands.
- Full FIDE edge cases for dead position and timeout-versus-possible-mate remain deferred as recorded in the M3 plan.
