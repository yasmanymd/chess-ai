# Architecture Constraints

## Document Control

| Field          | Value       |
| -------------- | ----------- |
| Status         | Accepted    |
| Version        | 1.0         |
| Decision owner | Yasmany     |
| Source         | Session 004 |

This document will record business, technical, delivery, legal, financial, and operational constraints that architecture alternatives must respect.

## Product Boundary Constraints

### AC-001 — No dedicated MVP administration interface

Operational administration will use protected platform tooling. A custom administrative panel is outside MVP scope.

### AC-002 — Future roles are not current implementation scope

Registered users, coaches, students, administrators, and tournament organizers may influence evolvability analysis but do not authorize implementation of their capabilities in the MVP.

### AC-003 — No unnecessary MVP integrations

Architecture must not require external identity, email, SMS, payment, advertising, social-network, remote chess-engine, matchmaking, persistent imported-file, or runtime AI services for MVP behavior.

### AC-004 — Conditional managed services

Managed services may be selected to reduce operational complexity. Material or recurring cost requires Yasmany's approval, and important data or contracts require a reasonable export or replacement strategy.

### AC-005 — Auxiliary-service isolation

Failure of observability or delivery infrastructure must not corrupt authoritative active-game processing or persisted game state.

### AC-006 — Browser is non-authoritative

The browser may improve responsiveness through presentation and prediction but cannot own identity, chess rules, turn order, official clocks, authoritative positions, results, or durability.

### AC-007 — Durable confirmation boundary

Authoritative state changes must satisfy the accepted durability requirement before success is reported to a player.

### AC-008 — Provider responsibility does not replace product design

Using managed infrastructure does not remove the product's responsibility to define security, backup, recovery, observability, portability, and failure semantics.

## Delivery and Technology Constraints

### AC-009 — Public project

The repository and documented development process will be public. Secrets and unintended personal or sensitive information must not be committed.

### AC-010 — Documentation language

Project documentation is written in English. Human–AI interviews may be conducted in Spanish.

### AC-011 — Human–AI authority

AI performs implementation work, while Yasmany retains decision and approval authority according to the accepted Human–AI Working Agreement.

### AC-012 — Milestone delivery without fixed deadline

The hobby project has no fixed deadline and will progress through accepted milestones.

### AC-013 — No preselected provider or stack

No cloud provider, architecture style, language, framework, or database technology is preselected. These require evidence-based evaluation and applicable approval.

### AC-014 — License pending

The software license requires research and explicit approval before public release.

### AC-015 — Web MVP

The MVP is a responsive web product. Native mobile applications are outside scope.

### AC-016 — Required languages

English, Spanish, and French are required in the first release.

### AC-017 — Maintained technology

Selected technologies and versions must be actively maintained and supported at selection time unless an explicitly approved exception provides compelling evidence.

### AC-018 — No legacy compatibility requirement

The predecessor project is a conceptual reference. The new system has no code-reuse, API-compatibility, or data-migration obligation to it.

### AC-019 — Reproducible development and CI

Local development and continuous integration must be reproducible through documented instructions and practical automation.

### AC-020 — Operational simplicity

Architecture must avoid unnecessary operational complexity for a hobby MVP.

### AC-021 — No MVP multi-region requirement

The MVP has no global multi-region deployment requirement. It must satisfy accepted capacity, latency, durability, and recovery targets without speculative geographic distribution.

### AC-022 — Reasonable cost

The design should maintain reasonable hobby-project cost. Material or recurring cost requires Yasmany's approval.

### AC-023 — Legal readiness before deployment

Software licensing, public privacy disclosure, and applicable terms must be investigated and resolved before public production deployment.

## Approval

| Role            | Name    | Decision                | Date       |
| --------------- | ------- | ----------------------- | ---------- |
| Project owner   | Yasmany | Accepted                | 2026-08-17 |
| AI collaborator | Codex   | Interviewed and drafted | 2026-08-17 |

## Revision History

| Version | Date       | Change                                                                        | Decision owner |
| ------- | ---------- | ----------------------------------------------------------------------------- | -------------- |
| 0.1     | 2026-08-17 | Constraint elicitation opened.                                                | Yasmany        |
| 1.0     | 2026-08-17 | Product-boundary, dependency, delivery, and operational constraints accepted. | Yasmany        |
