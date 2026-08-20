# Session 008 — Technology Stack Evaluation

## Session Metadata

| Field | Value |
|---|---|
| Date | 2026-08-19 |
| Status | Completed |
| Human participant | Yasmany |
| AI collaborator | Codex |
| Working language | Spanish |
| Artifact language | English |

## Objective

Evaluate and select an actively maintained technology stack that implements the accepted modular monolith, domain model, quality attributes, and validation experiments without introducing unnecessary operational complexity.

## Context

Architecture and domain boundaries are technology-independent and accepted. The stack must support authoritative real-time games, local transactions, durable events, restart recovery, typed contracts, architecture tests, accessibility, internationalization, and reproducible development.

Technology facts that may change over time will be verified against official documentation and targeted experiments.

## Evaluation Areas

1. Backend language and application framework.
2. Web framework and UI foundation.
3. Primary transactional database and data-access approach.
4. Real-time protocol and library.
5. Chess-rules library.
6. Test and architecture-enforcement tools.
7. Local development and packaging.
8. Hosting and observability compatibility without premature provider selection.

## Method

1. Elicit learning goals and technology preferences.
2. Agree on candidates and weighted criteria.
3. Verify current support and capabilities through primary sources.
4. Compare coherent stack combinations, not isolated popularity.
5. Identify experiments required before commitment.
6. Produce recommendations and separate ADR decisions.

## Decisions

| ID | Decision | Owner | Status |
|---|---|---|---|
| S008-D01 | Technology selection prioritizes correct delivery through the documented process rather than learning a specific technology. | Yasmany | Accepted |
| S008-D02 | TypeScript, Node.js, and React are strong preferred directions subject to formal evaluation. | Yasmany | Accepted as evaluation preference |
| S008-D03 | Selection should balance maturity, operational simplicity, productivity, and modern engineering practices. | Yasmany | Accepted |
| S008-D04 | Shared TypeScript code may contain public contracts but must not expose backend domain or infrastructure internals to the browser. | Yasmany | Accepted |
| S008-D05 | Backend candidates are NestJS with Fastify, direct Fastify composition, and AdonisJS. | Yasmany | Accepted for evaluation |
| S008-D06 | Web candidates are React with Vite, Next.js, and React Router framework mode. | Yasmany | Accepted for evaluation |
| S008-D07 | Runtime contract candidates are Zod, TypeBox, and Valibot. | Yasmany | Accepted for evaluation |
| S008-D08 | Candidate status and claimed capabilities will be supported by official documentation and primary repositories dated in the evaluation artifact. | Yasmany | Accepted process application |
| S008-D09 | The approved backend, web, and runtime-contract matrices use the documented weighted criteria and a one-to-five relative fit scale. | Yasmany | Accepted |
| S008-D10 | Select NestJS with its Fastify platform adapter for backend delivery and application composition. | Yasmany | Accepted |
| S008-D11 | Select Zod for runtime validation and shared public contracts. | Yasmany | Accepted |
| S008-D12 | Do not run the proposed comparative Fastify-versus-NestJS and Zod-versus-TypeBox spikes. | Yasmany | Accepted |
| S008-D13 | The five mandatory ADR-0001 validation experiments remain required for the selected stack. | Yasmany | Accepted |
| S008-D14 | Select React Router Framework Mode for the React web client while preserving NestJS as the sole authoritative backend. | Yasmany | Accepted |
| S008-D15 | Select PostgreSQL as the primary transactional database without running the proposed PostgreSQL, MySQL, and SQLite comparison. | Yasmany | Accepted |
| S008-D16 | Select Kysely with the `pg` driver for PostgreSQL access, subject to a focused persistence experiment. | Yasmany | Accepted, subject to validation |
| S008-D17 | Select Socket.IO through the official NestJS adapter for active-game real-time communication. | Yasmany | Accepted, subject to validation |
| S008-D18 | Use HTTP for game creation, lobby queries, history, and PGN; use Socket.IO for active-game commands and authoritative updates. | Yasmany | Accepted |
| S008-D19 | Require command identifiers, idempotent processing, explicit acceptance or rejection, versioned events, and authoritative snapshot synchronization after reconnection. | Yasmany | Accepted |
| S008-D20 | Start with one application instance and defer multi-instance Socket.IO infrastructure until justified by evidence. | Yasmany | Accepted |
| S008-D21 | Select chess.js behind a project-owned rules port for standard-chess move and position rules. | Yasmany | Accepted, subject to validation |
| S008-D22 | Keep multiplayer lifecycle, clocks, resignations, draw offers, claims, persistence, and FIDE termination distinctions in project-owned behavior. | Yasmany | Accepted |
| S008-D23 | Require authoritative reference tests for chess.js, including repetition, move-count, dead-position, and timeout edge cases. | Yasmany | Accepted |
| S008-D24 | Select Vitest and React Testing Library for TypeScript behavior and component tests. | Yasmany | Accepted, subject to repository validation |
| S008-D25 | Select Testcontainers with real PostgreSQL for persistence and integration tests; require a Docker-compatible local and CI runtime. | Yasmany | Accepted, subject to repository validation |
| S008-D26 | Select Playwright for end-to-end, multi-user, responsive, locale, and cross-browser testing. | Yasmany | Accepted, subject to repository validation |
| S008-D27 | Select `@axe-core/playwright` plus explicit keyboard and manual accessibility assessment. | Yasmany | Accepted |
| S008-D28 | Select dependency-cruiser plus ESLint import restrictions for executable architecture boundaries. | Yasmany | Accepted, subject to repository validation |
| S008-D29 | Treat coverage as diagnostic evidence and calibrate numeric thresholds after the first vertical slice instead of optimizing for an arbitrary global percentage. | Yasmany | Accepted |
| S008-D30 | Use a pnpm-workspace monorepo with `apps/server`, `apps/web`, and only genuinely shared packages. | Yasmany | Accepted, subject to repository validation |
| S008-D31 | Use Turborepo for local deterministic task coordination and caching; defer remote caching. | Yasmany | Accepted, subject to repository validation |
| S008-D32 | Use Node.js 24 LTS and PostgreSQL 18, pinning exact supported patch and container references during scaffolding. | Yasmany | Accepted |
| S008-D33 | Make Docker Compose the primary complete development environment for PostgreSQL, server, web, migrations, hot reload, and test execution. | Yasmany | Accepted, subject to clean-checkout validation |
| S008-D34 | Require Git and a supported Docker environment as the only host prerequisites for the primary contributor path. | Yasmany | Accepted |
| S008-D35 | Use strict TypeScript, ESLint, Prettier, and an independent type-check task as the static quality baseline. | Yasmany | Accepted |
| S008-D36 | Keep `.devcontainer` optional and preserve editor independence. | Yasmany | Accepted |
| S008-D37 | Use i18next and react-i18next in the web application for `en`, `es`, and `fr`, with English fallback and persisted explicit choice. | Yasmany | Accepted, subject to repository validation |
| S008-D38 | Keep server and persisted game behavior language-neutral; return stable error codes and let the web client render localized messages. | Yasmany | Accepted |
| S008-D39 | Require three-locale translation resources and locale behavior tests for each completed feature. | Yasmany | Accepted |
| S008-D40 | Use Pino JSON logs, health/readiness endpoints, safe correlation IDs, and durable game audit evidence as the MVP observability baseline. | Yasmany | Accepted, subject to repository validation |
| S008-D41 | Prepare OpenTelemetry traces and metrics through configuration without selecting a collector or hosted provider. | Yasmany | Accepted |
| S008-D42 | Do not include third-party analytics or behavioral tracking in the MVP. | Yasmany | Accepted |

The initial technology baseline is selected. Implementation proof remains required for the decisions explicitly marked subject to validation.

## Accepted Technology Baseline

- Backend: NestJS with Fastify, Zod, Socket.IO, Pino, and configuration-ready OpenTelemetry.
- Web: React Router Framework Mode with i18next and react-i18next.
- Data: PostgreSQL 18, Kysely, `pg`, explicit migrations, and transactional outbox discipline.
- Rules: chess.js behind a project-owned rules port.
- Quality: Vitest, React Testing Library, Testcontainers, Playwright, axe, dependency-cruiser, ESLint, strict TypeScript, and Prettier.
- Repository: pnpm workspaces, Turborepo, Node.js 24 LTS, and Docker Compose as the complete hot-reloading development environment.

## Required Validation Before Implementation Is Proven

The selected stack is not implementation-proven until evidence demonstrates:

1. durable atomic move confirmation, PostgreSQL migration discipline, idempotency, and concurrent update protection;
2. two-player Socket.IO communication, explicit command results, reconnection synchronization, and restart recovery;
3. chess.js compatibility with standard rules and the project-owned FIDE termination policies;
4. executable architecture boundaries among domain, application, delivery, persistence, shared contracts, and web code;
5. the accepted initial capacity target of 100 simultaneous games and 500 active connections;
6. a clean-checkout Docker Compose experience with migrations, hot reload, and container-executed tests;
7. English, Spanish, and French UI behavior; accessibility evidence; safe observability; and no third-party behavior tracking.

These validations consolidate but do not replace the detailed acceptance criteria in ADR-0001 and ADR-0006 through ADR-0012.

## Deferred Decisions

The following are intentionally outside this selection session and require separate evidence and approval when they become relevant:

- hosting, CI/CD, DNS, production deployment topology, and rollback provider;
- public-repository software license, privacy disclosure, terms, and data-retention policy;
- registered accounts, authentication, and external identity providers;
- observability collector, storage, dashboards, alerting, retention, and vendor;
- horizontal Socket.IO scaling, additional infrastructure, and remote Turborepo caching;
- exact dependency and container-image patches, to be pinned during repository scaffolding;
- locale-prefixed URLs, server-rendered localization, advanced PGN annotation display, chess variants, and educational product features.

## Closure

Yasmany approved closing Session 008 on 2026-08-19. The initial technology baseline is ready to guide repository creation and the first architecture-validation vertical slice.

## Next Step

Create the new repository from the portable planning folder, scaffold the container-first workspace, pin exact versions, and execute the required validation evidence incrementally.
