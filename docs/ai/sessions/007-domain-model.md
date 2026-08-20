# Session 007 — Domain Model

## Session Metadata

| Field | Value |
|---|---|
| Date | 2026-08-18 |
| Status | Completed |
| Human participant | Yasmany |
| AI collaborator | Codex |
| Working language | Spanish |
| Artifact language | English |

## Objective

Define the MVP domain language, aggregate boundaries, entities, value objects, invariants, commands, events, and state transitions before technology selection.

## Context

ADR-0001 establishes a modular monolith. ADR-0002 establishes Temporary Identity, Lobby, Game, Game Archive, and Chess Interchange as business modules with explicit data and dependency boundaries.

The domain model must preserve server authority, durable move confirmation, deterministic reconstruction, reconnectable sessions, atomic lobby admission, and standards-based chess interoperability.

## Interview Plan

1. Agree on aggregates, entities, and value objects.
2. Define aggregate invariants and ownership.
3. Define lifecycle state machines.
4. Define commands and outcomes.
5. Define domain and integration events.
6. Review terminology and approve the model.

## Decisions

| ID | Decision | Owner | Status |
|---|---|---|---|
| S007-D01 | Domain aggregates are TemporaryIdentity, PlayerParticipation, WaitingGame, and ChessGame. | Yasmany | Accepted |
| S007-D02 | PlayerSeat, MoveRecord, GameClock, and DrawOffer are internal ChessGame entities. | Yasmany | Accepted |
| S007-D03 | Domain identifiers, names, title, color, time control, chess notation and position concepts, result, reason, instant, and duration are immutable value objects. | Yasmany | Accepted |
| S007-D04 | AvailableGameList, ArchivedGame, GameSearchIndex, Replay, and ImportedGame are non-authoritative read or ephemeral models. | Yasmany | Accepted |
| S007-D05 | Global name uniqueness uses an atomic persistence constraint rather than a single aggregate containing all names. | Yasmany | Accepted |
| S007-D06 | ChessGame state-changing commands require versioning, locking, or equivalent proven serialization. | Yasmany | Accepted |
| S007-D07 | The proposed TemporaryIdentity, PlayerParticipation, WaitingGame, and ChessGame invariants are accepted. | Yasmany | Accepted |
| S007-D08 | A waiting game expires when its disconnected creator's 15-minute lobby identity reservation expires. | Yasmany | Accepted |
| S007-D09 | The proposed TemporaryIdentity, PlayerParticipation, WaitingGame, ChessGame, and DrawOffer lifecycle state machines are accepted. | Yasmany | Accepted |
| S007-D10 | A connected player returns to Lobby with the same reserved identity after game completion; later disconnection starts the standard grace period. | Yasmany | Accepted |
| S007-D11 | Disconnection changes presence but does not pause an active game or official clock. | Yasmany | Accepted |
| S007-D12 | A move by the recipient of a pending draw offer supersedes that offer. | Yasmany | Accepted |
| S007-D13 | Threefold repetition and the fifty-move rule require a valid player claim; fivefold repetition and the seventy-five-move rule are automatic. | Yasmany | Accepted |
| S007-D14 | Draw claims may concern the current state or a declared intended legal move as defined by the adopted FIDE rules. | Yasmany | Accepted |
| S007-D15 | A dead position and the timeout exception use the standard of whether checkmate is possible through any legal sequence, not a simplified material-only test. | Yasmany | Accepted |
| S007-D16 | Product Requirements 1.1 replaces the earlier imprecise draw interpretation. | Yasmany | Accepted |
| S007-D17 | The proposed Temporary Identity, Lobby, and Game command catalog is accepted. | Yasmany | Accepted |
| S007-D18 | External state-changing commands are idempotent by CommandId, use expected versions where applicable, and return stable authoritative results. | Yasmany | Accepted |
| S007-D19 | Queries do not mutate state, system adjudications are explicit internal commands, and generic update commands are forbidden. | Yasmany | Accepted |
| S007-D20 | The proposed Temporary Identity, Lobby, and Game event catalogs are accepted. | Yasmany | Accepted |
| S007-D21 | Published events carry identity, schema, aggregate version, authoritative time, correlation, and causation metadata. | Yasmany | Accepted |
| S007-D22 | MoveConfirmed is delivered only after durable commit, while GameCompleted is atomic with terminal state and drives Game Archive. | Yasmany | Accepted |
| S007-D23 | Event consumers are idempotent, required aggregate ordering is preserved, and cross-module contracts are versioned. | Yasmany | Accepted |
| S007-D24 | Immediate-consistency workflows use coordinated local transactions rather than eventual events. | Yasmany | Accepted |
| S007-D25 | Domain Model version 1.0 is accepted. | Yasmany | Accepted |

## AI Errors

The earlier AI proposal described threefold repetition and the fifty-move rule as automatic draw conditions and used "insufficient mating material" as the timeout exception. Verification against FIDE Laws of Chess articles 6.9 and 9.2–9.6 showed that the first two require a valid claim, automatic thresholds are fivefold repetition and seventy-five moves, and the timeout standard is whether checkmate is possible through any legal sequence.

The error materially affected accepted requirements. Yasmany approved the correction, which is recorded in Product Requirements 1.1.

## Open Questions

None within the scope of this session.

## Next Step

Evaluate technology-stack alternatives against the accepted requirements, architecture, module boundaries, domain model, and mandatory experiments.
