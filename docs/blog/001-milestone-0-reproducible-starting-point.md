# Milestone 0: A Reproducible Starting Point

The first visible chessboard came later. The first real feature was much less photogenic: a command that had to work on a clean machine.

For Chess AI, the opening move was a promise to the next developer: clone the repository, run Docker Compose, and get a database, server, web application, migrations, and hot reload without spending the afternoon recreating someone else's laptop.

```text
clone repository → docker compose up --build → develop
```

That promise became Milestone 0.

## Why Start Here?

Multiplayer chess is not just a board in a browser. It needs a frontend, a server, a transactional database, migrations, realtime connections, and tests that exercise more than mocked objects. If every contributor configures those pieces differently, invisible bugs accumulate before the project has a public screen.

Yasmany chose a container-first path: Git and a supported Docker environment would be the only host prerequisites for normal development. The repository would use TypeScript, React, Node.js, PostgreSQL, pnpm workspaces, and Turborepo—but no private checklist of local setup steps.

## The Environment We Built

The monorepo began with `apps/web` and `apps/server`. Docker Compose coordinates PostgreSQL, migrations, the server, and the web application. Runtime versions are pinned: Node.js 24 LTS, pnpm 11, PostgreSQL 18, and explicit container references.

The detail that changed the experience was source-only mounting. The first design mounted the repository into containers. It worked, but it also caused `node_modules` and the pnpm store to appear on the host checkout—the opposite of the clean workflow we wanted. We changed to a development image that installs dependencies internally and mounts only source code for hot reload.

## Reality Reviewed the First Draft

The first container build did exactly what a useful environment should do: challenge optimistic assumptions.

An AI-proposed `@types/react-dom` version did not exist in npm. The real installation found it immediately. pnpm 11 also rejected `esbuild`'s lifecycle script by default. Rather than broadly enabling scripts, the workspace allowed only the explicitly needed tool.

The first database migration revealed another lesson. A Kysely migrator import and a PostgreSQL timestamp default both needed correction during a genuine migration run. Type checking was valuable, but it could not prove that a migration would work against PostgreSQL.

These issues were small. That is why they matter: small setup errors compound as a project grows.

## What “Done” Meant

Configuration files were not enough. The milestone required evidence: PostgreSQL became healthy, migrations completed, server and web were reachable, hot reload worked, containerized quality checks passed, and unit, real PostgreSQL integration, and Playwright/axe browser tests ran successfully. Dependency isolation was also verified: the host checkout did not retain `node_modules` or a pnpm store.

One narrowly scoped exception was documented. Testcontainers needed an ephemeral runner with Docker-socket access; application services remained non-root. Reproducibility is not hiding exceptions. It is recording them precisely enough to repeat the result.

## The Lesson

A reproducible environment is not administrative work before “real development.” It is the first product decision about how quickly, safely, and honestly the project can evolve.

The next milestone could finally focus on something visible: a public, accessible, multilingual shell. But it would do so on an environment that had already been asked to prove itself.

## Source Record

- [Milestone 0 plan](../plan/milestone-0-bootstrap-plan.md)
- [Milestone 0 implementation session](../ai/sessions/010-milestone-0-bootstrap.md)
- [Technology-stack evaluation](../ai/sessions/008-technology-stack-evaluation.md)
