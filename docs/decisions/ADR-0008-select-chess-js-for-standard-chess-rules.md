# ADR-0008: Select chess.js for Standard Chess Rules

## Metadata

| Field             | Value                           |
| ----------------- | ------------------------------- |
| Status            | Accepted, subject to validation |
| Date              | 2026-08-19                      |
| Decision owner    | Yasmany                         |
| AI contributor    | Codex                           |
| Related session   | Session 008                     |
| Related decisions | ADR-0001 and ADR-0002           |

## Context

The authoritative Game module requires dependable standard-chess move generation and validation, check, checkmate, stalemate, castling, en passant, promotion, position serialization, and standard notation. Reimplementing the complete move-rules engine would add substantial correctness risk without differentiating the product.

The main TypeScript candidates considered were chess.js and chessops. chessops provides additional variant and PGN-tree capabilities but uses the GPL-3.0-or-later license and includes capabilities outside the MVP. chess.js focuses on standard chess, is written in TypeScript, has no runtime dependencies, and uses the permissive BSD-2-Clause license.

## Decision

Use **chess.js** as the initial standard-chess rules library, behind a project-owned `ChessRulesPort` or equivalent domain-facing abstraction.

The exact stable version will be pinned when the new repository is scaffolded. The selection remains subject to a focused rules-compatibility experiment.

## Boundary Rules

1. chess.js classes, move objects, and library-specific types remain inside a rules adapter.
2. Domain entities, public contracts, and persisted records cannot depend directly on chess.js types.
3. The system persists explicit project-owned data and standard representations such as moves, FEN, SAN, result, and game metadata.
4. chess.js validates positions and chess moves; it does not own the multiplayer game lifecycle.
5. The application owns player participation, command handling, clocks, resignations, draw offers, draw claims, persistence, and event publication.
6. Generic library draw or game-over methods cannot replace the project's explicitly accepted FIDE termination policies.
7. Threefold repetition and the fifty-move rule remain claim-based; fivefold repetition and the seventy-five-move rule remain automatic.
8. Dead-position and timeout-versus-possible-mate outcomes use the accepted legal-position interpretation and require dedicated verification.
9. Client-side use of the library, if any, is advisory only; the server performs authoritative validation.

## Rationale

chess.js provides a small and established TypeScript implementation of the standard move rules needed by the MVP. Its narrow focus and permissive license make it a simpler initial dependency than a variant-oriented library. A project-owned port prevents the external API from defining the domain model and permits replacement if the validation experiment exposes a correctness or capability gap.

## Consequences

### Positive

- Avoids implementing legal move generation from scratch.
- TypeScript implementation fits the selected runtime.
- Supports standard position and notation workflows.
- No runtime dependencies.
- Permissive license reduces redistribution constraints.
- Existing tests and adoption provide a useful starting point.

### Negative

- Correctness still depends partly on an external library.
- Library game-over methods may not represent every accepted FIDE and product distinction.
- Advanced educational analysis trees or chess variants may require additional tooling later.
- Mapping code is required between library types and domain types.

## Required Validation

The chess-rules experiment must demonstrate:

1. legal and illegal normal moves;
2. check, checkmate, and stalemate;
3. castling rights and castling through check restrictions;
4. en passant and promotion choices;
5. FEN round trips and deterministic state reconstruction;
6. SAN generation and PGN export compatibility;
7. threefold versus fivefold repetition behavior;
8. fifty-move versus seventy-five-move behavior;
9. dead-position and timeout-versus-possible-mate edge cases;
10. adapter isolation from domain and public-contract types;
11. reference positions derived from authoritative FIDE rules and trusted interoperability fixtures.

Any mismatch is documented. Material mismatches must be handled by an application rule, an adapter correction backed by tests, or reopening this decision.

## Evidence

- The chess.js primary repository describes a TypeScript library for move generation and validation, piece placement and movement, and check, checkmate, and draw detection.
- Its package documentation includes FEN, PGN, move, and game-state APIs and reports no runtime dependencies.
- Its repository is distributed under the BSD-2-Clause license.
- chessops provides broader variant and PGN capabilities under GPL-3.0-or-later.

Evidence was reviewed on 2026-08-19.

## AI Contribution

Codex evaluated chess.js and chessops, recommended chess.js for the standard-chess MVP, and proposed the adapter boundary and FIDE-focused validation rules.

## Human Approval

Yasmany approved chess.js and the proposed boundary and validation rules on 2026-08-19.
