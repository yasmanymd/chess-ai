# Implementation Roadmap

## Document Control

| Field          | Value             |
| -------------- | ----------------- |
| Status         | Accepted          |
| Version        | 1.1               |
| Decision owner | Yasmany           |
| Source         | Sessions 009, 044 |
| Date           | 2026-08-27        |

## Purpose

Guide incremental implementation of the accepted chess-platform MVP. Each milestone is outcome-based and must produce product evidence, engineering evidence, updated documentation, and a recorded work session before it is considered complete.

The roadmap does not impose calendar deadlines. Later milestones may be refined as evidence changes implementation priorities, but changes to accepted scope, architecture, or milestone outcomes require explicit approval.

## Delivery Principles

1. Build vertical slices that prove behavior through the user interface, public contracts, application logic, and persistence where relevant.
2. Keep the server authoritative for game decisions from the first active-game implementation.
3. Prefer real PostgreSQL, browser, container, and network evidence over mocked substitutes for critical behavior.
4. Keep the development environment container-first and reproducible.
5. Deliver English, Spanish, and French resources with each completed visible feature.
6. Apply accessibility, security, observability, and architecture checks continuously rather than treating them as a final cleanup phase.
7. Record decisions, experiments, evidence, limitations, and material AI errors in the public process documentation.

## Milestones

### Milestone 0 — Reproducible Bootstrap

**Outcome:** A clean checkout provides a complete containerized development system.

**Scope:**

- Create the public GitHub repository from the approved portable planning folder.
- Scaffold the pnpm-workspace monorepo, `apps/server`, `apps/web`, and only the initially justified shared packages.
- Pin exact Node.js, PostgreSQL, pnpm, dependency, and container-image versions.
- Provide Docker Compose development services for PostgreSQL, migrations, server, and web.
- Provide source mounts, hot reload, named dependency/cache volumes, health checks, environment examples, and safe reset commands.
- Establish strict TypeScript, ESLint, Prettier, dependency-cruiser, Vitest, Testcontainers, Playwright, and baseline commands.
- Establish basic Pino logging, correlation, `/health`, and `/ready`.

**Exit evidence:**

1. A fresh clone on a supported host runs the documented Compose startup command.
2. PostgreSQL is healthy, migrations complete, and server, web, and Socket.IO become reachable.
3. A frontend edit updates the browser automatically; a backend edit restarts or reloads automatically.
4. Root commands run formatting, linting, type checks, architecture checks, unit tests, integration tests, and a minimal browser test from containers.
5. The experiment meets EXP-0005 and the applicable ADR-0009 through ADR-0012 bootstrap validation criteria.

### Milestone 1 — Public Application Shell

**Outcome:** A navigable, accessible, localized public website exists before multiplayer behavior.

**Scope:**

- Build the React Router application shell, routes, layout, error boundaries, and initial responsive design system.
- Configure i18next and react-i18next for English, Spanish, and French.
- Add accessible language selection and locale persistence.
- Add application health visibility, safe errors, initial structured observability, and browser accessibility checks.

**Exit evidence:**

1. The website is usable in all three locales and preserves an explicit locale choice.
2. Keyboard navigation, focus behavior, responsive layouts, and automated accessibility checks pass for the shell.
3. Browser tests verify the public routes and locale switching.
4. No game authority, private server representation, or localized backend prose leaks into client contracts.

### Milestone 2 — Temporary Identity and Public Lobby

**Outcome:** Two independent browsers can use temporary unique display names, create or join a waiting game, and enter an active-game shell.

**Scope:**

- Implement temporary identity, globally unique display-name rules, public game listing, and game creation/joining.
- Add HTTP contracts, PostgreSQL persistence, Socket.IO admission, and module boundaries for Temporary Identity and Lobby.
- Render active-game participation state without implementing chess moves.

**Exit evidence:**

1. Two browser contexts use distinct valid names and join the same game through the public lobby.
2. Invalid, duplicate, conflicting, and repeated admission commands produce safe, localized, idempotent outcomes.
3. PostgreSQL constraints and integration tests prove unique-name and admission behavior.
4. Architecture rules prevent cross-module persistence access and transport logic from owning business decisions.

### Milestone 3 — Authoritative Chess Play

**Outcome:** Two players can complete an authoritative standard chess game in real time.

**Scope:**

- Implement the Game module, project-owned chess rules port, chess.js adapter, game commands, state transitions, and authoritative clock behavior.
- Implement board interaction, legal-move feedback, promotion, check, basic completion states, and Socket.IO game events.
- Validate public command/event schemas with Zod and track game versions or sequences.

**Exit evidence:**

1. The server accepts legal moves and rejects illegal, stale, duplicate, or unauthorized commands.
2. Two browser contexts observe ordered authoritative state and clocks.
3. Standard move, check, mate, stalemate, castling, en passant, and promotion test cases pass.
4. The chess rules adapter boundary and relevant EXP-0004 evidence are complete.
5. Client-side interaction cannot create a durable accepted move without server confirmation.

### Milestone 4 — Durability, Recovery, and Concurrency

**Outcome:** Confirmed active games survive failures and concurrent delivery hazards without losing or duplicating accepted state.

**Scope:**

- Add atomic game-state and outbox writes, command idempotency storage, concurrency protection, retry-safe event delivery, and restart reconstruction.
- Implement reconnection synchronization from an authoritative snapshot.
- Refine FIDE draw-claim and automatic-termination behavior, timeout outcomes, and durable audit evidence.

**Exit evidence:**

1. A confirmed move is durable together with its required outbox record (EXP-0001).
2. Repeated and concurrent commands do not duplicate moves or corrupt clocks.
3. A server restart and client reconnection restore the correct authoritative game state (EXP-0003).
4. Required FIDE edge-case reference tests pass.
5. Logs, metrics, traces, and audit evidence are safe, correlated, and distinct in responsibility.

### Milestone 5 — Archive and Chess Interchange

**Outcome:** Completed and imported games can be viewed, replayed, exported, and safely validated.

**Scope:**

- Build Game Archive query projections, public history routes, and localized replay UI.
- Implement PGN export and single-game PGN import through the Chess Interchange module.
- Support standard games from normal and valid FEN initial positions, subject to accepted MVP limits.

**Exit evidence:**

1. Completed games appear in public history and replay deterministically.
2. PGN export and supported import round trips preserve main-line game facts.
3. Invalid PGN and invalid positions are rejected safely with localized client messages.
4. Archive and interchange access game data only through approved contracts and projections.

### Milestone 6 — Release Readiness

**Outcome:** The MVP has evidence sufficient to evaluate public deployment readiness.

**Scope:**

- Complete responsive, accessibility, security, performance, recovery, and operational evidence.
- Run the initial capacity experiment for 100 simultaneous games and 500 active connections (EXP-0002).
- Prepare release documentation, backup/recovery procedure, incident notes, and public development narrative.
- Resolve deployment provider, CI/CD, license, privacy disclosure, terms, and any required legal decisions before public production release.

**Exit evidence:**

1. Critical user journeys pass in supported browsers, locales, and responsive viewports.
2. Automated checks and documented manual accessibility assessment satisfy the accepted MVP standard.
3. Capacity, durability, restart, backup, and recovery evidence meets accepted targets or records an explicitly approved revision.
4. Public-release legal, privacy, hosting, deployment, and observability-provider decisions are accepted.
5. The release candidate has a complete evidence index and known-limitations record.

### Milestone 7 — Educational Foundations

**Status:** Completed and approved on 2026-08-27.

**Outcome:** Public study positions provide a small, multilingual, server-validated learning experience without accounts or a live chess-analysis dependency.

**Scope:**

- Publish a small, version-controlled catalog of public study positions with FEN, one correct move, localized editorial content, and clear learning categories.
- Add a public Study route, exercise catalog, and responsive exercise board that orients itself from the solver's side.
- Validate each attempt on the server through an exercise-specific contract; the browser cannot declare a solution correct by itself.
- Provide a hint and retry after an incorrect move, an explanation and next-exercise action after a correct move, and local per-browser completion progress.

**Exit evidence:**

1. The six approved exercises are available in English, Spanish, and French, with valid positions and authoritative single-move validation.
2. A learner can solve, miss, retry, complete, and navigate between exercises on desktop and phone.
3. Progress survives refresh in the same browser and can be reset only after confirmation.
4. Automated tests prove server validation, localization, orientation, and the core study journey.
5. The catalog is clearly editorial and reviewable; no real-time AI or chess-engine evaluation is represented as part of the feature.

## Deferred Decisions That Do Not Block Early Milestones

- CI provider and workflow design.
- Hosting and production deployment provider.
- Public repository license, privacy disclosure, and terms.
- Registered accounts and authentication.
- Production telemetry collector, dashboards, alerts, and retention.
- Horizontal scaling and remote task caching.

They must be resolved before the milestone where their absence becomes a stated exit blocker.

## Work-Session Pattern

Each implementation work session must record:

1. objective and approved scope;
2. decisions and assumptions;
3. implementation changes and files affected;
4. automated and manual evidence;
5. known limitations, risks, and rejected AI proposals where material;
6. milestone progress and the next proposed decision.

## Approval

Yasmany approved this milestone sequence on 2026-08-19.
