# ADR-0010: Adopt a Container-First Monorepo

## Metadata

| Field | Value |
|---|---|
| Status | Accepted, subject to repository validation |
| Date | 2026-08-19 |
| Decision owner | Yasmany |
| AI contributor | Codex |
| Related session | Session 008 |
| Related decisions | ADR-0001 through ADR-0009 |

## Context

The new repository must provide a reproducible development environment for contributors and AI agents. A developer should not need to install or align local Node.js, pnpm, or PostgreSQL versions. After cloning the repository, a Docker Compose command should start the complete development system, and edits to frontend or backend source code should trigger automatic reloads.

The repository contains two deployable applications and a small number of genuinely shared packages. The backend remains a modular monolith; its business modules do not become independently published workspace packages merely to mirror logical boundaries.

## Decision

Adopt a **pnpm-workspace monorepo** coordinated by **Turborepo** and designed for **container-first development**.

Use this initial top-level structure:

```text
/
├── apps/
│   ├── server/
│   │   └── src/modules/
│   └── web/
├── packages/
│   ├── contracts/
│   ├── test-support/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
├── infrastructure/
│   └── local/
├── scripts/
├── compose.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

The exact structure may be reduced during scaffolding when an empty package would add no value. New packages require a demonstrated shared responsibility and explicit dependency direction.

## Runtime Baseline

1. Use **Node.js 24 LTS**, pinned to an exact supported patch and immutable container reference during scaffolding.
2. Use **PostgreSQL 18**, initially targeting the current supported minor release and pinning the image reference during scaffolding.
3. Pin pnpm through the root `packageManager` declaration and the development image.
4. Commit the pnpm lockfile.
5. Use stable dependency releases unless an approved experiment justifies a prerelease.

## Container-First Development Rules

1. `docker compose up --build` starts PostgreSQL, the NestJS server, and the React web application in development mode.
2. Frontend and backend source trees are mounted into their containers for automatic reload after edits.
3. Container-managed named volumes hold `node_modules` and caches to avoid host-platform dependency conflicts.
4. PostgreSQL uses a named data volume so ordinary restarts preserve local data.
5. Health checks and readiness behavior prevent the server from accepting work before required infrastructure and migrations are ready.
6. Migration execution is explicit, observable, repeatable, and safe when no migrations are pending.
7. Development and production images use appropriate multi-stage targets and non-root runtime users.
8. The supported developer hosts are macOS, Linux, and Windows with Git and Docker Desktop or a compatible Docker Compose runtime.
9. Unit, integration, architecture, and end-to-end test commands are executable from containers.
10. A `.devcontainer` configuration may be provided as an optional convenience but cannot be required to develop the system.
11. Docker Compose Watch may be enabled when validated; conventional source mounts and framework watchers remain the compatibility baseline.
12. Generated files and bind-mounted paths must preserve usable ownership and permissions on supported hosts.
13. Host access uses documented, stable local URLs and ports, with overrides available through environment variables where necessary.
14. Only a documented `.env.example` is committed; secrets and local environment files are ignored.

## Workspace Rules

1. `apps/server` and `apps/web` are the initial deployable applications.
2. Backend business modules remain within `apps/server/src/modules` and follow ADR-0002 boundaries internally.
3. `packages/contracts` contains versioned Zod schemas and public TypeScript contracts only.
4. Shared packages cannot become a route for exposing backend domain or infrastructure internals to the browser.
5. `packages/test-support` contains reusable test infrastructure, not production domain behavior.
6. Shared ESLint and TypeScript configuration packages keep executable standards consistent.
7. Turborepo coordinates and caches deterministic tasks locally; remote caching is deferred.

## Baseline Commands

The repository root provides consistent commands for:

- `dev`
- `build`
- `test`
- `test:integration`
- `test:e2e`
- `lint`
- `format`
- `typecheck`
- `architecture`
- database migration and reset operations
- Compose startup, shutdown, logs, rebuild, and deliberate cleanup

Command names may gain scoped variants, but the documented root workflow remains the primary interface for humans and AI agents.

## Static Quality Baseline

1. Enable strict TypeScript settings and document any relaxation.
2. Run `tsc --noEmit` or an equivalent explicit type-check task independently from bundling.
3. Use ESLint, including the architecture import restrictions accepted in ADR-0009.
4. Use Prettier for deterministic formatting.
5. CI verifies formatting, linting, types, architecture, tests, and builds rather than relying solely on local hooks.

## Acceptance Experiment

Validate the development environment from a clean checkout on a machine with only Git and a supported Docker environment:

1. clone the repository;
2. run the single documented Compose startup command;
3. observe healthy PostgreSQL, migrations, server, web, and Socket.IO connectivity;
4. open the application through the documented URL;
5. edit a frontend source file and observe the browser update;
6. edit a backend route or handler and observe automatic server restart or reload;
7. run representative unit, PostgreSQL integration, and two-browser end-to-end tests from containers;
8. stop and restart without losing ordinary development data;
9. run the deliberate clean-reset command and obtain a known empty state;
10. repeat the essential path on supported host operating systems or record the environments actually verified.

Failure to meet this acceptance path blocks declaring the repository bootstrap complete.

## Rationale

A container-first workflow makes the executable environment part of the repository and minimizes machine-specific setup. pnpm workspaces provide efficient TypeScript dependency management, while Turborepo provides incremental task coordination without redefining architectural boundaries. Keeping backend modules inside one server application reflects the accepted modular-monolith deployment model.

## Consequences

### Positive

- Contributors need only Git and a compatible Docker environment.
- Runtime, package-manager, database, and system dependencies are reproducible.
- The documented environment is suitable for both humans and AI agents.
- Frontend and backend retain an interactive hot-reload workflow.
- CI and local development can share container definitions and commands.
- Workspace packages remain limited to actual shared concerns.

### Negative

- Docker becomes a hard prerequisite for the primary development workflow.
- Bind-mount and filesystem performance differs across host operating systems.
- File permissions, watchers, and signal handling require cross-platform validation.
- Containerized hot reload can consume more resources than host-native execution.
- Docker Compose is a development and orchestration tool, not the final production-platform decision.

## Evidence

- Node.js identifies version 24 as an LTS release line with support scheduled through April 2028.
- PostgreSQL identifies version 18 as supported through November 2030 and recommends running the current minor release.
- Turborepo supports pnpm workspaces, task scheduling, and local output caching based on declared inputs and outputs.

Evidence was reviewed on 2026-08-19.

## AI Contribution

Codex proposed the monorepo structure and tooling baseline. After Yasmany clarified the desired contributor experience, Codex revised the runtime approach to include all application and database components in a hot-reloading Docker Compose environment and defined a clean-checkout acceptance experiment.

## Human Approval

Yasmany approved the repository proposal and explicitly required a container-oriented development environment in which a contributor can clone, start Docker Compose, and immediately edit hot-reloading frontend and backend code. He approved the revised container-first rules on 2026-08-19.
