# ADR-0002: Define Modular Boundaries and Dependency Rules

## Metadata

| Field            | Value       |
| ---------------- | ----------- |
| Status           | Accepted    |
| Date             | 2026-08-17  |
| Decision owner   | Yasmany     |
| AI contributor   | Codex       |
| Related session  | Session 006 |
| Related decision | ADR-0001    |

## Context

ADR-0001 selects a modular monolith. Without enforceable ownership and dependency rules, a single deployable can degrade into unrestricted shared state and tightly coupled code.

The MVP requires immediate consistency for player admission and authoritative game commands, durable publication of completed games, replaceable chess and persistence adapters, and strong testability.

## Decision

Define five backend business modules:

1. Temporary Identity.
2. Lobby.
3. Game.
4. Game Archive.
5. Chess Interchange.

Game is the sole authority for active positions, turns, clocks, move history, and results. Lobby owns waiting-game and participation-admission invariants. Game Archive owns public query projections. Chess Interchange owns PGN validation and representation. Temporary Identity owns temporary names and sessions.

A single physical database is permitted, but every module owns its logical data and prohibits direct cross-module table access.

Modules communicate through public commands, results, immutable versioned events, and purpose-specific query contracts. Domain logic depends on ports rather than infrastructure. Automated architecture and contract tests enforce boundaries.

## Rationale

These boundaries align with distinct business invariants while preserving local transactions for the few workflows requiring immediate consistency. They isolate high-risk chess and clock logic, support durable archive projection, and provide plausible future extraction points without distributed deployment today.

## Consequences

### Positive

- Explicit ownership of invariants and data.
- Testable infrastructure independence.
- Controlled cross-module transactions.
- Durable asynchronous projections without losing authoritative completion.
- Clear extraction criteria.

### Negative

- Requires ongoing architecture-test discipline.
- Public contracts add deliberate design work.
- Some workflows require an application coordinator across module APIs.
- A shared physical database still requires conventions preventing accidental cross-access.

## Rejected Approaches

- Shared domain entities and unrestricted table access.
- A separate deployable for every module.
- A preemptively separate real-time gateway.
- Treating adapters as owners of business behavior.

## AI Contribution

Codex proposed the module set, ownership model, transaction and event rules, ports-and-adapters boundaries, dependency constraints, and extraction criteria. Yasmany requested clarification of ports, reviewed the explanation, and approved the complete rules.

## Human Approval

Yasmany accepted the module boundaries and dependency rules on 2026-08-17.

## Follow-up Actions

1. Define the domain model, aggregate boundaries, commands, and domain events.
2. Select technologies capable of enforcing these boundaries.
3. Implement automated architecture tests.
4. Refine transactional-outbox behavior during persistence design.
