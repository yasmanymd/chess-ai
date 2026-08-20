# Architecture Alternatives

## Document Control

| Field | Value |
|---|---|
| Status | Accepted |
| Version | 1.0 |
| Decision owner | Yasmany |
| Source | Session 005 |

## Purpose

This document will compare viable MVP architecture styles against the accepted requirements, quality attributes, context, and constraints. It will separate architectural style from later technology selection.

## Candidate Set

### ALT-1 — Modular Monolith

One deployable backend contains explicitly bounded modules for temporary identity, lobby, authoritative games, clocks, history, and PGN. Modules interact through defined internal contracts and use a primary transactional data store.

### ALT-2 — Modular Core with Separate Real-Time Gateway

Authoritative domain processing and persistence remain in a modular core, while client real-time connections run in a separately deployed gateway. The gateway must coordinate commands, delivery, reconnects, and backpressure with the core.

### ALT-3 — Microservices

Identity, lobby, game, and history responsibilities are independently deployed services communicating through APIs or events. Each service owns defined behavior and potentially its own data boundary.

### ALT-4 — Managed Serverless and Event-Driven Architecture

Managed functions, data services, event infrastructure, and real-time capabilities process commands and distribute state. Provider-managed scaling and operations replace some long-running application responsibilities.

## Common Scope

All candidates include a responsive web client and must satisfy the same accepted requirements. A candidate cannot gain points by omitting server authority, durability, recovery, accessibility, languages, security, or verification obligations.

## Selection Status

No candidate is selected. The preliminary expectation that a modular monolith may fit the accepted drivers is a hypothesis to test, not a decision.

## Evaluation Criteria

| Criterion | Weight |
|---|---:|
| Correctness and state integrity | 20% |
| Recovery and durability | 18% |
| Simplicity, maintainability, and testability | 17% |
| Security and privacy | 15% |
| Real-time synchronization and performance | 12% |
| Evolvability | 7% |
| Accessibility and internationalization | 6% |
| Scale beyond initial targets | 5% |
| **Total** | **100%** |

## Scoring Scale

- **1:** Poor fit or very high delivery risk.
- **2:** Feasible with significant disadvantages.
- **3:** Adequate.
- **4:** Good fit.
- **5:** Excellent fit.

Scores compare the effort and risk of satisfying accepted requirements. They do not merely indicate theoretical feasibility.

## Mandatory Gates

Every viable candidate must support:

- Server-authoritative game state.
- Zero confirmed-move loss.
- Reconnection and process-restart recovery.
- Complete standard chess rules.
- Secure temporary sessions.
- English, Spanish, and French.
- WCAG 2.2 Level AA.
- Accepted initial capacity.
- Automated and reproducible verification evidence.

A candidate that cannot satisfy a gate is rejected regardless of weighted score.

## Weighted Evaluation

| Criterion | Weight | ALT-1 | ALT-2 | ALT-3 | ALT-4 |
|---|---:|---:|---:|---:|---:|
| Correctness and state integrity | 20 | 5 | 4 | 3 | 3 |
| Recovery and durability | 18 | 5 | 4 | 3 | 4 |
| Simplicity, maintainability, and testability | 17 | 5 | 3 | 1 | 2 |
| Security and privacy | 15 | 4 | 4 | 3 | 3 |
| Real-time synchronization and performance | 12 | 4 | 5 | 3 | 3 |
| Evolvability | 7 | 4 | 4 | 5 | 3 |
| Accessibility and internationalization | 6 | 4 | 4 | 4 | 4 |
| Scale beyond initial targets | 5 | 3 | 4 | 5 | 5 |
| **Weighted score / 100** | **100** | **90.0** | **79.0** | **59.2** | **63.4** |

All four candidates are theoretically capable of passing the gates with sufficient design and engineering. The scores reflect relative MVP risk and effort.

## ALT-1 Evaluation — Modular Monolith

### Strengths

- A single authoritative transaction boundary makes command serialization and durable confirmation direct.
- Active-game recovery can use one coherent persistence model.
- Domain, contract, integration, and end-to-end tests avoid distributed coordination during the MVP.
- One deployable backend minimizes operational cost and failure modes.
- Explicit modules preserve meaningful boundaries and allow later extraction based on evidence.
- The accepted initial load does not require independent service scaling.

### Liabilities

- A process failure affects all backend capabilities until recovery.
- Poor module discipline could degrade into a tightly coupled monolith.
- Real-time connections and ordinary HTTP work share deployment capacity unless isolated internally.
- Scaling is primarily coarse-grained.

### Important Controls

- Enforced module boundaries and dependency rules.
- A durable command transaction before client confirmation.
- Stateless connection recovery where practical.
- Load testing for connection and game concurrency.
- Clear adapters around chess rules, persistence, time, and delivery.

## ALT-2 Evaluation — Modular Core with Separate Real-Time Gateway

### Strengths

- Connection handling can scale and fail separately from authoritative domain processing.
- The authoritative core can preserve a coherent game transaction boundary.
- Backpressure and connection concerns receive an explicit boundary.
- Provides a plausible later evolution from or toward a modular monolith.

### Liabilities

- Every command and state update crosses a process boundary.
- Delivery, retry, ordering, deduplication, and reconnect coordination become distributed concerns.
- Requires at least two deployables plus a communication mechanism.
- More integration and failure-mode testing is required.

### Important Controls

- Idempotent command identifiers.
- Explicit ordering and retry semantics.
- Gateway authorization against authoritative sessions.
- Reliable state resynchronization after gateway failure.

## ALT-3 Evaluation — Microservices

### Strengths

- Independent deployment and scaling boundaries.
- Strong ownership boundaries can support a larger organization.
- Individual capabilities may evolve with separate operational profiles.

### Liabilities

- The project has one human decision owner and AI implementation team, not multiple independent product teams.
- Identity, lobby, game, clocks, and history have tightly related consistency requirements.
- Distributed transactions, event ordering, idempotency, and eventual consistency substantially increase risk.
- Security surface, deployment count, observability work, and operational cost multiply.
- End-to-end recovery becomes harder to reason about and prove.
- Independent scale is not required by the accepted capacity target.

### Important Controls

- Formal service and data ownership.
- Reliable event delivery, deduplication, and versioning.
- Distributed tracing and failure injection.
- Contract and compatibility testing.

## ALT-4 Evaluation — Managed Serverless and Event-Driven

### Strengths

- Managed scaling can absorb uneven request load.
- Some infrastructure operations and availability concerns shift to providers.
- Usage-based pricing may be efficient at low traffic.
- Managed durable data and event primitives may support recovery.

### Liabilities

- Long-lived real-time connections and authoritative clocks may require provider-specific services.
- Cold starts, execution limits, delivery semantics, and retries complicate predictable game behavior.
- Local reproduction and full-system testing can be harder.
- Provider contracts and data models may create substantial lock-in.
- Cost behavior under persistent connections requires evidence.
- Functions do not eliminate the need for game serialization, durability, or recovery design.

### Important Controls

- Provider-specific proof of real-time and clock behavior.
- Idempotent and ordered state transitions.
- Cost and latency experiments.
- Portable domain logic and exportable data.

## Preliminary Result

ALT-1, the Modular Monolith, has the strongest fit with the accepted MVP drivers. ALT-2 is the most credible fallback or evolution path if experiments show that connection handling must scale or fail independently.

ALT-3 and ALT-4 offer scaling properties beyond current needs while adding correctness, recovery, testing, or operational risks that conflict with higher-priority drivers.

This result is a recommendation, not an accepted architecture decision.

## Required Validation Experiments

### EXP-0001 — Durable move confirmation

Demonstrate that a move can be validated, serialized, persisted, and acknowledged without violating the zero-confirmed-move-loss objective under injected process failure.

### EXP-0002 — Initial real-time capacity

Demonstrate that one backend deployment topology can support 500 active connections and 100 simultaneous games while satisfying accepted correctness and latency targets.

### EXP-0003 — Active-game restart recovery

Demonstrate recovery of sessions, positions, turns, draw state, clocks, and confirmed moves after process restart within the accepted recovery target.

### EXP-0004 — Chess-library boundary

Demonstrate that the selected chess-rules library can remain behind a domain-facing adapter and be verified by contract and rules tests without leaking broadly into transport or UI code.

### EXP-0005 — Reproducible local environment

Demonstrate that a clean supported workstation can start the application and principal verification suites through documented, practical automation.

The experiments will be refined after candidate technologies are known. Failing evidence must trigger reassessment rather than silent weakening of architecture drivers.

## Evaluation Approval

Yasmany approved the candidate scoring, rationale, and required validation experiments on 2026-08-17. This approval accepts the evaluation method and result, not yet the architecture selection.

## Selection

Yasmany selected ALT-1, Modular Monolith, as the initial MVP architecture style on 2026-08-17. ADR-0001 is the authoritative decision record.

## Revision History

| Version | Date | Change | Decision owner |
|---|---|---|---|
| 0.1 | 2026-08-17 | Candidate and evaluation draft opened. | Yasmany |
| 1.0 | 2026-08-17 | Evaluation accepted and modular monolith selected. | Yasmany |
