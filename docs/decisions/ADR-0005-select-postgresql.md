# ADR-0005: Select PostgreSQL as the Primary Transactional Database

## Metadata

| Field             | Value                 |
| ----------------- | --------------------- |
| Status            | Accepted              |
| Date              | 2026-08-19            |
| Decision owner    | Yasmany               |
| AI contributor    | Codex                 |
| Related session   | Session 008           |
| Related decisions | ADR-0001 and ADR-0002 |

## Context

The modular monolith requires atomic player admission, authoritative game transactions, zero loss of confirmed moves, unique temporary names, command idempotency, optimistic or pessimistic concurrency, durable completion events, searchable history, and restart recovery.

PostgreSQL, MySQL, and SQLite were proposed for comparison. Yasmany selected PostgreSQL directly.

## Decision

Use **PostgreSQL** as the primary transactional database.

Use one physical database initially, with logical ownership boundaries for Temporary Identity, Lobby, Game, Game Archive, and Chess Interchange-related persistence where applicable.

The exact supported PostgreSQL major version will be pinned when the new repository and deployment baseline are created.

## Boundary Rules

1. Each module owns its tables or logical schema.
2. Modules cannot directly access another module's tables.
3. ORM or query models cannot enter domain entities.
4. Confirmed game state and required outbox records use atomic transactions.
5. Schema migrations are versioned, automated, reviewed, and tested.
6. Database constraints reinforce global uniqueness, idempotency, and referential integrity where applicable.
7. Backup and recovery behavior must satisfy accepted RPO and RTO targets.

## Rationale

PostgreSQL provides the transactional, constraint, concurrency, indexing, and query capabilities required by authoritative games and public history. It is widely available as a managed or self-hosted service and supports the accepted single-database modular-monolith design.

## Consequences

### Positive

- Strong transactional consistency.
- Atomic outbox and terminal-state persistence.
- Unique and relational constraints.
- Concurrency-control options.
- Flexible indexing and public-history queries.
- Broad hosting availability.

### Negative

- Local development requires a database process or container.
- Schema ownership remains a convention requiring tests and permissions where practical.
- Backup, migration, pooling, and operational tuning remain project responsibilities.

## Subsequent Decision

ADR-0006 selects Kysely with the `pg` driver, subject to a focused persistence experiment.

## AI Contribution

Codex proposed PostgreSQL, MySQL, and SQLite for evaluation and recommended PostgreSQL preliminarily. Yasmany selected PostgreSQL without requiring the comparison.

## Human Approval

Yasmany selected PostgreSQL on 2026-08-19.
