# Session 010 — Milestone 0 Bootstrap

## Session Metadata

| Field             | Value                                |
| ----------------- | ------------------------------------ |
| Date              | 2026-08-19                           |
| Status            | Completed                            |
| Human participant | Yasmany                              |
| AI collaborator   | Codex                                |
| Working language  | Spanish                              |
| Artifact language | English                              |
| Milestone         | Milestone 0 — Reproducible Bootstrap |

## Objective

Scaffold the approved container-first monorepo in the public repository and produce initial evidence for a reproducible Docker Compose development environment.

## Preconditions

- The portable planning contents are committed and published as `8be7db5` on `main`.
- Docker Engine 28.1.1 and Docker Compose v2.36.0-desktop.1 are available on the current development host.
- The repository working tree was clean before scaffold changes began.

## Approved Scope

- Create the workspace, container configuration, web and server baselines, database migration baseline, and quality-tool baseline defined in the Milestone 0 plan.
- Pin exact stable versions after compatibility verification.
- Keep product modules and gameplay behavior out of this session.

## Decisions

| ID       | Decision                                                                    | Owner   | Status   |
| -------- | --------------------------------------------------------------------------- | ------- | -------- |
| S010-D01 | Begin implementation of Milestone 0 in the published `chess-ai` repository. | Yasmany | Accepted |

## Evidence Log

| Item                               | Result                                                                                                        | Status |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| Repository baseline                | `main` clean and synchronized with `origin/main` before scaffold work.                                        | Passed |
| Docker Engine                      | Version 28.1.1 available.                                                                                     | Passed |
| Docker Compose                     | Version v2.36.0-desktop.1 available.                                                                          | Passed |
| PostgreSQL image                   | `postgres:18.6-bookworm` downloaded and inspected successfully.                                               | Passed |
| Compose configuration              | `docker compose config --quiet` passed.                                                                       | Passed |
| Bootstrap dependencies             | pnpm workspace installation completed after explicitly allowing the required `esbuild` build script.          | Passed |
| Database migration                 | Initial Kysely migration completed successfully.                                                              | Passed |
| Running services                   | PostgreSQL healthy; migration completed successfully; server and web running.                                 | Passed |
| Health endpoints                   | `GET /health` returned `ok`; `GET /ready` returned `ready`.                                                   | Passed |
| Type checking                      | Server and web type checks passed from the server container.                                                  | Passed |
| Quality checks                     | Prettier, ESLint, and dependency-cruiser passed in containers.                                                | Passed |
| Tests                              | Unit, Testcontainers PostgreSQL integration, and Playwright/axe tests passed.                                 | Passed |
| Hot reload                         | Temporary server and web source changes were observed, then reverted.                                         | Passed |
| Containerized dependency isolation | No `node_modules` or pnpm store remains on the host repository; dependencies reside in the development image. | Passed |

## Material Adjustments

1. The initial package manifest referenced `@types/react-dom@19.2.8`, which does not exist in npm. It was corrected to the current published `19.2.4` version. This was an AI-generated dependency-version error discovered by the real container installation.
2. pnpm 11 rejected the `esbuild` lifecycle script by default. The project now uses the workspace-level `allowBuilds` setting to permit only `esbuild`, preserving an explicit supply-chain control.
3. The initial Kysely migrator import path and PostgreSQL timestamp default required correction during the first real migration run. The migrator now imports from `kysely/migration` and uses explicit `sql\`now()\``.
4. React Router Framework Mode generated types required `rootDirs` and Vite client-type configuration before the web TypeScript check could pass.
5. The initial Compose approach bind-mounted the repository and consequently materialized dependency directories on the host. It was replaced with a development image that installs dependencies internally and source-only bind mounts for hot reload. This preserves the clone-and-compose workflow without cluttering the host checkout.
6. TypeScript was pinned to 6.0.3 because dependency-cruiser does not yet support TypeScript 7.
7. Docker Desktop requires the ephemeral Testcontainers runner to use a root-only socket mount and host override; application services remain non-root.
8. Vite now explicitly permits the internal `web` hostname used by the browser test.

## Next Step

Milestone 0 acceptance validation completed. Proceed to the Milestone 1 design interview.
