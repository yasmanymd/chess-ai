# Session 006 — Modular Boundaries and Dependency Rules

## Session Metadata

| Field | Value |
|---|---|
| Date | 2026-08-17 |
| Status | Completed |
| Human participant | Yasmany |
| AI collaborator | Codex |
| Working language | Spanish |
| Artifact language | English |

## Objective

Define the modular-monolith boundaries, ownership responsibilities, allowed dependencies, and interaction rules that will preserve correctness, maintainability, and future extraction options.

## Context

ADR-0001 selects a modular monolith with one backend deployable, one primary transactional store, a separate web client, central authoritative transactions, and explicit adapters for chess rules, persistence, time, and communication.

## Interview Plan

1. Agree on backend module candidates.
2. Define ownership and data boundaries.
3. Define commands, events, and allowed dependencies.
4. Define cross-cutting platform capabilities.
5. Review module-level failure and extraction boundaries.

## Decisions

| ID | Decision | Owner | Status |
|---|---|---|---|
| S006-D01 | Backend business modules are Temporary Identity, Lobby, Game, Game Archive, and Chess Interchange. | Yasmany | Accepted |
| S006-D02 | HTTP/real-time delivery, persistence, chess rules, clocks, observability, configuration, and security plumbing are technical boundaries or cross-cutting capabilities rather than business modules. | Yasmany | Accepted |
| S006-D03 | Game is the sole authority permitted to modify active positions and official game results. | Yasmany | Accepted |
| S006-D04 | The separately delivered Web Client consumes contracts and remains non-authoritative. | Yasmany | Accepted |
| S006-D05 | A single physical database may be used, while every module exclusively owns its tables or logical schema and forbids direct cross-module data access. | Yasmany | Accepted |
| S006-D06 | Temporary Identity owns sessions; Lobby owns waiting games and participation admission; Game owns authoritative game data; Game Archive owns public projections; imported PGN is not automatically persisted. | Yasmany | Accepted |
| S006-D07 | Lobby owns the one-waiting-or-active-game admission invariant; Game owns authoritative participant and game invariants after start. | Yasmany | Accepted |
| S006-D08 | Immediate cross-module invariants may use explicit coordinated local transactions through public module contracts. | Yasmany | Accepted |
| S006-D09 | Game persists terminal state and a durable completion event atomically; Game Archive may update asynchronously but cannot lose a completed game. | Yasmany | Accepted |
| S006-D10 | Modules exchange identifiers, commands, results, immutable events, and purpose-specific contracts rather than shared mutable entities or direct table access. | Yasmany | Accepted |
| S006-D11 | Delivery depends on module application APIs; allowed module interactions use public contracts, while Game depends only on abstract chess, clock, persistence, and event ports. | Yasmany | Accepted |
| S006-D12 | Domain modules cannot depend on delivery, frameworks, databases, providers, cycles, or another module's internals; adapters cannot contain business decisions. | Yasmany | Accepted |
| S006-D13 | Immediate actions use synchronous commands; committed later consequences use durable, versioned events with idempotent consumers. | Yasmany | Accepted |
| S006-D14 | State-changing commands support retry detection, and client success comes from authoritative command results rather than asynchronous projections. | Yasmany | Accepted |
| S006-D15 | Automated architecture and contract tests will enforce module, port, adapter, and event boundaries. | Yasmany | Accepted |
| S006-D16 | Temporary Identity validates presented sessions, while each application use case authorizes requested behavior. | Yasmany | Accepted |
| S006-D17 | Modules expose stable typed errors and persist stable codes; localization belongs to the Web Client. | Yasmany | Accepted |
| S006-D18 | Correlation is propagated safely, configuration is validated and injected, time uses a clock port, identifiers avoid unnecessary database coupling, and application coordination owns transactions. | Yasmany | Accepted |
| S006-D19 | Technical validation and abuse controls belong at adapters, while business authorization belongs in use cases. | Yasmany | Accepted |
| S006-D20 | Module extraction requires evidence and a new ADR; the real-time gateway is only the first candidate if evidence justifies separation. | Yasmany | Accepted |
| S006-D21 | Modular Boundaries version 1.0 and ADR-0002 are accepted. | Yasmany | Accepted |

## Open Questions

None within the scope of this session.

## Next Step

Define the domain model, aggregates, commands, events, and state transitions before selecting technologies.
