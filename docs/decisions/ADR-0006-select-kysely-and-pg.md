# ADR-0006: Select Kysely and pg for PostgreSQL Access

## Metadata

| Field | Value |
|---|---|
| Status | Accepted, subject to validation |
| Date | 2026-08-19 |
| Decision owner | Yasmany |
| AI contributor | Codex |
| Related session | Session 008 |
| Related decisions | ADR-0001, ADR-0002, and ADR-0005 |

## Context

The authoritative server requires explicit PostgreSQL transactions, concurrency control, atomic game-state and outbox writes, module-owned persistence, and query behavior that remains visible and testable. The data-access layer must provide useful TypeScript safety without allowing persistence models to become domain models.

Kysely, Drizzle, and Prisma were considered as candidates. Codex recommended Kysely with the `pg` driver because its type-safe SQL query-builder model provides direct control over SQL and transactions while adding compile-time assistance. Yasmany had not used Kysely before and accepted the recommendation partly as an opportunity to learn it through the project.

## Decision

Use **Kysely** as the TypeScript SQL query builder and **`pg`** as the PostgreSQL driver.

Use explicit, versioned, reviewable migrations. The initial persistence experiment must validate the exact migration mechanism before the repository baseline is finalized.

Pin exact stable versions only when the new repository is scaffolded. Do not adopt a prerelease version without a separate approved reason.

## Boundary Rules

1. Kysely database types and query objects remain in persistence adapters.
2. Domain entities, value objects, commands, and events cannot depend on Kysely or `pg`.
3. Each module exposes its persistence needs through its own ports and adapters and accesses only its owned tables.
4. Transaction boundaries are controlled by application use cases or explicit coordination adapters, not hidden inside domain objects.
5. Confirmed game state and its required outbox record must be written atomically.
6. Migrations are immutable after application to a shared environment; corrections use new migrations.
7. Generated or handwritten SQL must be inspectable in code review and exercised against PostgreSQL in integration tests.

## Rationale

Kysely offers a relatively thin, type-safe layer over SQL. This fits the accepted ports-and-adapters design better than adopting an active-record or generated-domain-model abstraction. It also preserves the control needed for PostgreSQL constraints, locking, optimistic concurrency, outbox writes, and specialized history queries.

The `pg` driver is selected as the direct PostgreSQL connection and pooling layer beneath Kysely.

## Consequences

### Positive

- SQL structure and transaction boundaries remain explicit.
- TypeScript provides compile-time assistance for tables, columns, inputs, and results.
- Advanced PostgreSQL behavior remains accessible.
- Persistence adapters can map database records to domain types without redefining the domain.
- The abstraction is small enough to replace if later evidence requires it.

### Negative

- Kysely is new to the human decision owner.
- Developers must understand SQL and PostgreSQL rather than relying on a high-level ORM.
- Database type definitions and schema migrations require deliberate synchronization.
- Repository conventions and mapping code must be designed explicitly.

## Required Validation

Before treating the selection as implementation-proven, create a small vertical persistence experiment that demonstrates:

1. a PostgreSQL migration and rollback strategy;
2. module-qualified or otherwise clearly owned tables;
3. a typed repository adapter with domain mapping;
4. an atomic game-state plus outbox write;
5. a uniqueness-conflict path for temporary player names;
6. concurrent update protection for a game aggregate;
7. integration-test isolation and deterministic cleanup.

Failure of this experiment reopens the tool decision without invalidating the PostgreSQL decision.

## Evidence

- The Kysely primary repository publishes stable releases and distinguishes prerelease versions.
- The Kysely migrator implementation provides migration ordering, locking, and transactional execution when supported by the dialect.
- PostgreSQL-specific behavior and final version compatibility still require the project experiment.

Evidence was reviewed on 2026-08-19.

## AI Contribution

Codex compared the architectural fit of Kysely, Drizzle, and Prisma and recommended Kysely with `pg`. It also proposed making the decision conditional on a focused persistence experiment because the tool is new to Yasmany and documentation alone cannot prove project fit.

## Human Approval

Yasmany approved trying Kysely with `pg` on 2026-08-19, noting that Kysely was new to him and could provide a learning opportunity.
