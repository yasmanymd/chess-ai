# ADR-0001: Adopt a Modular Monolith for the MVP

## Metadata

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-08-17 |
| Decision owner | Yasmany |
| AI contributor | Codex |
| Related session | Session 005 |
| Related requirements | Product Requirements 1.0 |
| Related drivers | Quality Attributes and Architecture Drivers 1.0 |

## Context

The MVP requires server-authoritative chess rules and clocks, atomic command processing, zero loss of confirmed moves, restart recovery, real-time synchronization, public history, PGN interoperability, three languages, WCAG 2.2 AA, and an initial target of 100 simultaneous games and 500 active connections.

Operational simplicity, maintainability, and testability rank above scaling beyond initial targets. The project has one human decision owner and AI implementation agents rather than multiple independently operating product teams.

## Decision Drivers

1. Chess correctness and authoritative-state integrity.
2. Confirmed-move durability and active-game recovery.
3. Security and privacy.
4. Simplicity, maintainability, and testability.
5. Real-time synchronization and accepted latency.
6. Accessibility and internationalization.
7. Evolution toward accounts and education.
8. Scale beyond initial targets.

## Options Considered

### Option 1 — Modular Monolith

One deployable backend with explicit internal modules and one primary transactional data store.

Weighted evaluation score: **90.0 / 100**.

### Option 2 — Modular Core with Separate Real-Time Gateway

An authoritative modular core plus an independently deployed connection gateway.

Weighted evaluation score: **79.0 / 100**.

### Option 3 — Microservices

Independently deployed identity, lobby, game, and history services.

Weighted evaluation score: **59.2 / 100**.

### Option 4 — Managed Serverless and Event-Driven Architecture

Provider-managed functions, events, data services, and real-time capabilities.

Weighted evaluation score: **63.4 / 100**.

## Decision

Adopt a **modular monolith** as the initial MVP backend architecture.

The initial system will have:

- One backend deployable.
- Explicit modules with enforceable dependency boundaries.
- Central authoritative command processing and transaction control.
- One primary transactional data store.
- A separately delivered web client.
- Explicit adapters around chess rules, persistence, time, and client communication.

The real-time gateway is the first candidate for later extraction if measured connection scale, failure isolation, or deployment needs justify it.

## Rationale

The modular monolith provides the clearest transaction and consistency boundary for authoritative games. It minimizes distributed ordering, retry, deduplication, and recovery risks while satisfying the accepted initial scale.

Explicit module boundaries preserve maintainability and provide an evolution path without imposing multiple deployables, distributed data ownership, or provider-specific event semantics before evidence requires them.

## Consequences

### Positive

- Direct authoritative transactions and durable confirmation.
- Fewer runtime failure modes.
- Lower operational and hosting complexity.
- Simpler local development and end-to-end testing.
- Easier deterministic recovery and audit.
- Incremental extraction remains possible.

### Negative

- Backend capabilities share one deployment and failure domain.
- Scaling is initially coarse-grained.
- Real-time connections share backend deployment capacity.
- Module discipline must be actively enforced to prevent accidental coupling.

### Risks

- A poorly structured implementation could become a tightly coupled monolith.
- Connection load might later require independent scaling.
- A single process topology must demonstrate accepted capacity and recovery behavior.

## Mandatory Validation

The decision is subject to:

- EXP-0001: Durable move confirmation.
- EXP-0002: Initial real-time capacity.
- EXP-0003: Active-game restart recovery.
- EXP-0004: Chess-library boundary.
- EXP-0005: Reproducible local environment.

If required evidence fails, this ADR must be reviewed rather than silently weakening accepted requirements.

## AI Contribution

Codex structured the candidate set, derived weighted criteria from previously accepted drivers, scored the alternatives, documented trade-offs, and recommended the modular monolith. Yasmany reviewed and approved the evaluation before making the final selection.

## Human Approval

Yasmany explicitly accepted the modular-monolith architecture on 2026-08-17.

## Follow-up Actions

1. Define internal module boundaries and dependency rules.
2. Evaluate technology-stack alternatives separately.
3. Refine and execute the five mandatory experiments.
4. Define data and transaction boundaries.
5. Define runtime and deployment views.

