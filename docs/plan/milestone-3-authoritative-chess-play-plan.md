# Milestone 3 — Authoritative Chess Play Plan

## Document Control

| Field | Value |
| --- | --- |
| Status | Accepted |
| Version | 0.1 |
| Decision owner | Yasmany |
| Prepared by | Codex |
| Date | 2026-08-24 |
| Milestone | Milestone 3 — Authoritative Chess Play |

## Objective

Turn the M2 active-game shell into a real two-player standard-chess game. The server is the only authority for position, turn, legal moves, clocks, lifecycle transitions, and accepted results. The browser renders confirmed state and may provide advisory interaction only.

## Inherited Decisions

This plan does not reopen these accepted decisions:

- Use `chess.js` behind a project-owned `ChessRulesPort`; no public or domain contract exposes library-specific types (ADR-0008).
- NestJS/Fastify and PostgreSQL remain the server and transactional store.
- Socket.IO is a notification/delivery channel; commands and authoritative queries remain HTTP-owned unless a later approved contract changes this boundary.
- Temporary session cookies identify players. A display name never authorizes a move.
- Standard FIDE behavior applies. Threefold repetition and the fifty-move rule are claim-based; fivefold repetition and the seventy-five-move rule are automatic.
- The UI supports English, Spanish, and French and remains usable on mobile devices.

## Proposed Delivery Slices

### M3.1 — Chess Rules Boundary and Compatibility Evidence

**Outcome:** The server has a tested, replaceable rules adapter before it accepts a real player move.

- Pin a stable `chess.js` version in the server workspace.
- Define `ChessRulesPort` contracts in project-owned terms: FEN, turn, legal destinations, move intent, accepted move, SAN, status, and termination facts.
- Implement a `chess.js` adapter that receives and returns only those project-owned representations.
- Complete EXP-0004 with reference fixtures for normal moves, check, mate, stalemate, castling, en passant, promotion, FEN, SAN, and repetition/move-count behavior.
- Add architecture checks prohibiting direct `chess.js` imports outside the adapter.

**Evidence:** Adapter contract tests, reference-position tests, and an architecture test pass.

### M3.2 — Authoritative Move Transaction

**Outcome:** A legal move is accepted exactly through the Game module and becomes the next authoritative state.

- Extend active-game persistence with project-owned current position, side to move, version/sequence, status, and accepted-move history.
- Add `POST /games/:id/moves` with Zod validation for source square, destination square, promotion choice when applicable, and client command ID.
- Authenticate player participation, validate the expected version and turn, and ask only the rules adapter to evaluate the move.
- In one database transaction, persist the accepted move, resulting FEN, SAN, side to move, game status, and next version.
- Reject unauthorized, malformed, out-of-turn, illegal, stale, and duplicate commands with stable public error codes and no state change.
- Publish a non-authoritative `game.updated` notification after confirmation; clients refetch or reconcile the authoritative game snapshot.

**Evidence:** Two isolated player contexts submit legal and conflicting commands; only one valid transition is committed and both see the same ordered state.

### M3.3 — Interactive Board and Promotion

**Outcome:** Players can use the board on desktop and mobile without trusting the client.

- Replace the M2 board placeholder with pieces derived only from the confirmed FEN.
- Implement click/tap selection and legal-destination highlighting for the authenticated player whose turn it is.
- Submit a move only after selecting a destination; keep the prior confirmed state until the server response arrives.
- Present an accessible promotion choice for Queen, Rook, Bishop, and Knight before sending the promotion command.
- Show safe localized feedback for rejected commands and a compact move history using server-confirmed SAN.
- Prevent interaction for the opponent, completed games, and stale client state.

**Evidence:** Desktop and mobile browser tests cover selection, rejection, promotion, turn changes, and confirmed rendering.

### M3.4 — Clocks and Basic Completion

**Outcome:** Configured clocks and core chess outcomes are server-authoritative.

- Add authoritative clock state for `No clock`, `Rapid 10+0`, and `Blitz 5+3`.
- Calculate elapsed time at the server from recorded timestamps; the browser only renders estimates between confirmed snapshots.
- Apply increments after accepted moves and reject a late move if the player has already flagged.
- Detect and persist checkmate, stalemate, insufficient material/dead position, and timeout according to the accepted rules boundary.
- Render status, side to move, check indicator, result, and clocks for both players.

**Evidence:** Deterministic clock tests and rules fixtures pass; two browser contexts observe compatible clock and outcome data.

### M3.5 — Player Actions and Exit Validation

**Outcome:** A playable M3 game has the minimum explicit player actions and documented evidence.

- Implement resignation, draw offer, acceptance, rejection, and eligible draw claims as server-authoritative commands.
- Record lifecycle events and final results in project-owned persistence.
- Run container, unit, integration, browser, mobile, accessibility, localization, and architecture validation.
- Publish a concise M3 validation session that distinguishes completed evidence from deferred M4 recovery and outbox guarantees.

**Evidence:** The Milestone 3 exit criteria in the roadmap pass and the human visual review is recorded.

## New Decisions Requiring Approval

| ID | Decision | Proposed default | Why it matters |
| --- | --- | --- | --- |
| M3-D01 | Board input model | Click/tap only in M3; drag-and-drop may be added later as an enhancement. | It gives one accessible, reliable interaction model across touch and desktop. |
| M3-D02 | Client update strategy | Confirmed-state rendering with no optimistic piece movement. | It makes server authority visually unambiguous during the educational first implementation. |
| M3-D03 | Scope sequencing | Deliver the slices in order, retaining a usable game after each slice. | It limits risk in rules, transactions, UI, clocks, and completion logic. |

Yasmany approved all three proposed decisions on 2026-08-24.

## Explicitly Deferred to Milestone 4

- Transactional outbox and retry-safe delivery.
- Full restart reconstruction and reconnection synchronization guarantees.
- Durable command-idempotency store and concurrency stress hardening beyond the M3 version guard.
- Extended FIDE draw-claim edge cases and complete timeout-versus-possible-mate evidence.

## Exit Criteria

1. Two players can complete an authoritative standard game through the product UI.
2. The server accepts legal moves and safely rejects illegal, stale, duplicate, unauthorized, and out-of-turn commands.
3. Both players receive ordered confirmed position, turn, status, and configured clock state.
4. Normal moves, checks, checkmate, stalemate, castling, en passant, promotion, and basic termination fixtures pass.
5. No client interaction can persist an accepted move without server confirmation.
6. `chess.js` remains isolated behind the project-owned adapter and EXP-0004 evidence is completed.
