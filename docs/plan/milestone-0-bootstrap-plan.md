# Milestone 0 — Reproducible Bootstrap Plan

## Document Control

| Field          | Value       |
| -------------- | ----------- |
| Status         | Completed   |
| Version        | 0.1         |
| Decision owner | Yasmany     |
| Source         | Session 009 |
| Date           | 2026-08-19  |

## Objective

Create the new repository as a container-first, reproducible workspace that a contributor can clone and start with Git and Docker alone. Milestone 0 establishes engineering foundations; it does not implement product gameplay.

## Approved Database Bootstrap Behavior

1. `docker compose up --build` starts PostgreSQL in an empty state on its first run.
2. A dedicated migration step runs automatically and idempotently before the application server accepts authoritative traffic.
3. No demonstration or sample data is loaded by default.
4. Development seed data, if later useful, is opt-in through a separate documented command.
5. Ordinary Compose restarts preserve PostgreSQL data in a named volume.
6. A separate deliberate reset command removes local data and returns the environment to a known empty state.

## Planned Deliverables

### Repository Baseline

- The contents of the portable planning folder copied into the root of the new GitHub repository. `PROJECT_CHARTER.md` and `docs/` therefore become root-level repository paths rather than a nested planning subdirectory.
- Root README with prerequisites, one-command start, URLs, common commands, troubleshooting, and links to architecture and process documentation.
- Root pnpm workspace and Turborepo configuration.
- `apps/server`, `apps/web`, `packages/contracts`, `packages/test-support`, shared ESLint configuration, and shared TypeScript configuration, reduced only where an empty package has no immediate purpose.
- `.gitignore`, `.editorconfig`, `.env.example`, documented environment variables, and no committed secrets.
- Exact stable dependency, Node.js, pnpm, PostgreSQL, and container-image versions pinned and recorded.

### Container Environment

- Dockerfiles with development targets for web and server and separate production-ready stages.
- Compose services for PostgreSQL, migration execution, server, and web.
- Named volumes for database data, dependency installation, and relevant build caches.
- Bind-mounted source code with validated hot reload for both applications.
- Non-root container runtime users and cross-platform file-permission handling.
- Health checks, service readiness ordering, stable local ports, and container logs.
- Deliberate commands for start, stop, logs, rebuild, migration state, tests, and reset.

### Server Baseline

- NestJS using Fastify, with application composition separate from future business modules.
- Socket.IO endpoint reachable without product game behavior.
- Zod-based public-contract baseline.
- Pino JSON logging, correlation ID propagation, safe error shape, `/health`, and `/ready`.
- PostgreSQL connection baseline using Kysely and `pg`, isolated from domain code.
- Empty but executable architecture rules for module and layer boundaries.

### Web Baseline

- React Router Framework Mode application with a minimal public route.
- i18next/react-i18next setup for `en`, `es`, and `fr`, including English fallback.
- Accessible locale selector and a minimal translated page.
- Connection configuration for the server and Socket.IO, without product flows.
- Initial error boundary and responsive baseline.

### Quality Baseline

- Strict TypeScript, Prettier, ESLint, dependency-cruiser, and root scripts.
- Vitest and React Testing Library baseline tests.
- Testcontainers PostgreSQL integration-test bootstrap.
- Playwright browser-test bootstrap with a minimal accessibility scan.
- Commands executable from containers and documented with their expected purpose.

## Validation Evidence

Milestone 0 is complete only when the clean-checkout acceptance experiment in ADR-0010 passes and evidence records:

1. Compose startup output and health/readiness confirmation.
2. Automatic migration execution from an empty database and safe no-op behavior when rerun.
3. Frontend and backend hot reload after source edits.
4. Persistence of local data across normal restarts and reset through an explicit destructive command.
5. Formatting, lint, typecheck, architecture, unit, integration, and minimal browser/accessibility commands running from containers.
6. Safe structured logs and correlation IDs without secrets or unsafe request-body content.
7. English, Spanish, and French minimal-route rendering and language switching.
8. A limitations record for host operating systems and any unverified behavior.

## Deferred from Milestone 0

- Product modules and gameplay flows.
- CI provider and workflow design.
- Hosting, production deployment, and public domain configuration.
- Repository license, privacy disclosure, terms, and user authentication.
- Production telemetry exporter, collector, dashboards, and alerts.

## Open Design Questions

- Exact repository location, which Yasmany will provide after creating the GitHub repository.
- Final root service-port mapping and local URL names.
- Exact pinned package and image versions after compatibility verification during scaffolding.
- Whether any additional developer convenience service is justified beyond PostgreSQL, migrations, server, and web.
