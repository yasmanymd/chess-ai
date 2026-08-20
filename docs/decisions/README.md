# Architecture Decision Records

Architecture Decision Records capture significant decisions, their context, evaluated alternatives, consequences, evidence, AI contribution, and human approval.

## Naming

```text
ADR-NNNN-short-kebab-case-title.md
```

## Statuses

- Proposed
- Accepted
- Rejected
- Superseded
- Deprecated

## Initial decision candidates

- Repository and system organization.
- Server-authoritative game model.
- Chess rules library.
- Backend language and framework.
- Frontend framework.
- Real-time communication mechanism.
- Persistence technology.
- Authentication approach after MVP.
- Deployment platform.
- Software license.
- Internationalization architecture.
- Testing strategy.

## Decision Index

| ADR | Title | Status |
|---|---|---|
| [ADR-0001](ADR-0001-adopt-a-modular-monolith.md) | Adopt a Modular Monolith for the MVP | Accepted |
| [ADR-0002](ADR-0002-define-modular-boundaries.md) | Define Modular Boundaries and Dependency Rules | Accepted |
| [ADR-0003](ADR-0003-select-backend-framework-and-contract-validation.md) | Select NestJS with Fastify and Zod | Accepted |
| [ADR-0004](ADR-0004-select-react-router-framework-mode.md) | Select React Router Framework Mode | Accepted |
| [ADR-0005](ADR-0005-select-postgresql.md) | Select PostgreSQL | Accepted |
| [ADR-0006](ADR-0006-select-kysely-and-pg.md) | Select Kysely and pg for PostgreSQL Access | Accepted, subject to validation |
| [ADR-0007](ADR-0007-select-socket-io-for-real-time-communication.md) | Select Socket.IO for Real-Time Communication | Accepted, subject to validation |
| [ADR-0008](ADR-0008-select-chess-js-for-standard-chess-rules.md) | Select chess.js for Standard Chess Rules | Accepted, subject to validation |
| [ADR-0009](ADR-0009-select-the-automated-testing-toolchain.md) | Select the Automated Testing Toolchain | Accepted, subject to repository validation |
| [ADR-0010](ADR-0010-adopt-a-container-first-monorepo.md) | Adopt a Container-First Monorepo | Accepted, subject to repository validation |
| [ADR-0011](ADR-0011-adopt-web-internationalization-with-i18next.md) | Adopt Web Internationalization with i18next | Accepted, subject to repository validation |
| [ADR-0012](ADR-0012-establish-mvp-observability-baseline.md) | Establish the MVP Observability Baseline | Accepted, subject to repository validation |

Use [`../templates/adr-template.md`](../templates/adr-template.md).
