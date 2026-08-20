# Session 005 — Architecture Alternatives

## Session Metadata

| Field             | Value      |
| ----------------- | ---------- |
| Date              | 2026-08-17 |
| Status            | Completed  |
| Human participant | Yasmany    |
| AI collaborator   | Codex      |
| Working language  | Spanish    |
| Artifact language | English    |

## Objective

Evaluate viable architecture styles against the accepted product requirements, quality-attribute scenarios, system context, and constraints; recommend an initial architecture without selecting technologies prematurely.

## Context

The MVP requires server-authoritative chess, durable confirmation, reconnectable active games, real-time synchronization, public history, PGN interoperability, multilingual and accessible interfaces, initial capacity of 100 simultaneous games and 500 active connections, and operational simplicity suitable for a hobby project.

## Evaluation Method

1. Agree on candidate architectures.
2. Define weighted evaluation criteria from accepted drivers.
3. Describe each candidate using the same responsibility and deployment views.
4. Evaluate benefits, liabilities, failure modes, and evolution paths.
5. Identify assumptions requiring experiments.
6. Produce a recommendation.
7. Request Yasmany's decision.
8. Record the selected style in an Architecture Decision Record.

## Decisions

| ID       | Decision                                                                                                                                                                                                | Owner   | Status   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| S005-D01 | Evaluate a modular monolith, modular core with separate real-time gateway, microservices, and managed serverless/event-driven architecture.                                                             | Yasmany | Accepted |
| S005-D02 | A responsive web client and all accepted product obligations are common to every candidate.                                                                                                             | Yasmany | Accepted |
| S005-D03 | Weighted criteria use the accepted 20/18/17/15/12/7/6/5 distribution and a one-to-five fit scale.                                                                                                       | Yasmany | Accepted |
| S005-D04 | Server authority, zero confirmed-move loss, recovery, complete chess rules, session security, three languages, WCAG 2.2 AA, initial capacity, and reproducible verification are mandatory gates.        | Yasmany | Accepted |
| S005-D05 | The documented scores and rationale for the four candidates are accepted as the architecture-style evaluation result.                                                                                   | Yasmany | Accepted |
| S005-D06 | Five experiments will validate durable confirmation, initial real-time capacity, restart recovery, chess-library isolation, and reproducible local development.                                         | Yasmany | Accepted |
| S005-D07 | Adopt a modular monolith as the initial MVP backend architecture, subject to the five mandatory validation experiments.                                                                                 | Yasmany | Accepted |
| S005-D08 | Use one backend deployable, explicit modules, central authoritative transactions, one primary transactional store, a separate web client, and adapters for chess, persistence, time, and communication. | Yasmany | Accepted |
| S005-D09 | A separately deployable real-time gateway is the first extraction candidate if future evidence justifies it.                                                                                            | Yasmany | Accepted |
| S005-D10 | Architecture Alternatives version 1.0 and ADR-0001 are accepted.                                                                                                                                        | Yasmany | Accepted |

No architecture alternative has been selected. The preliminary modular-monolith recommendation remains an unverified hypothesis.

## Open Questions

None within the scope of this session.

## Next Step

Define modular boundaries and dependency rules, then evaluate technology-stack alternatives.
