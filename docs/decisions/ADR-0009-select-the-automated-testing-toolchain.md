# ADR-0009: Select the Automated Testing Toolchain

## Metadata

| Field | Value |
|---|---|
| Status | Accepted, subject to repository validation |
| Date | 2026-08-19 |
| Decision owner | Yasmany |
| AI contributor | Codex |
| Related session | Session 008 |
| Related decisions | ADR-0001 through ADR-0008 |

## Context

The project requires fast domain feedback, real PostgreSQL integration coverage, enforceable modular boundaries, two-player browser scenarios, real-time reconnection tests, three-language UI coverage, responsive behavior, and WCAG 2.2 AA verification. No single test tool covers these risks adequately.

The toolchain must remain understandable in a TypeScript workspace and produce evidence suitable for a public AI-assisted development record.

## Decision

Adopt the following complementary test and enforcement tools:

1. **Vitest** for domain, application, utility, contract, and React component tests.
2. **React Testing Library** for behavior-oriented React component tests.
3. **Testcontainers for Node.js** with a real **PostgreSQL** container for persistence and integration tests.
4. **Playwright** for browser end-to-end and multi-user tests.
5. **`@axe-core/playwright`** for automated accessibility checks within browser scenarios.
6. **dependency-cruiser** for dependency rules, forbidden imports, and cycle detection.
7. **ESLint import restrictions** for rapid local feedback on architecture boundaries.
8. Zod-backed HTTP and Socket.IO contract tests shared across producers and consumers.

Docker-compatible container execution is a local-development and CI prerequisite for integration tests.

Exact stable versions, runners, reporters, and workspace configuration will be pinned during repository scaffolding.

## Test-Layer Responsibilities

### Domain and Application

- Exercise chess lifecycle, clocks, commands, draw policies, state transitions, and invariants without network or database dependencies.
- Use deterministic clocks, identifiers, and event collectors through ports rather than global mocks.
- Prefer state-based and contract-based tests over implementation-detail assertions.

### Component

- Exercise React behavior through roles, labels, visible state, keyboard interaction, and locale-aware output.
- Avoid tests that primarily assert component internals or CSS implementation details.

### Integration

- Run real migrations against PostgreSQL.
- Verify constraints, Kysely mappings, atomic transactions, outbox writes, idempotency, locking or version conflicts, and restart reconstruction.
- Do not substitute SQLite or an in-memory database for PostgreSQL behavior.

### Architecture

- Enforce domain independence from NestJS, Socket.IO, Kysely, `pg`, React, and transport schemas.
- Prevent direct imports between module internals and direct access to another module's persistence adapters.
- Detect circular dependencies and undocumented cross-layer shortcuts.

### End to End

- Exercise the running web and server applications with real browser contexts and PostgreSQL.
- Cover two isolated players, public lobby admission, legal and illegal moves, clocks, completion, reconnection, restart recovery, history, PGN, locales, and responsive layouts.
- Run a defined critical subset across Chromium, Firefox, and WebKit; broader permutations may run on a scheduled or release workflow if CI cost requires it.

### Accessibility

- Run axe checks against meaningful UI states, not only initial page loads.
- Test keyboard-only operation and focus behavior explicitly.
- Record manual accessibility assessment because automated tools cannot prove WCAG conformance.

## Coverage Policy

Coverage reports are required as diagnostic evidence, but a high global percentage is not a proxy for correctness.

- Critical domain rules and failure paths require explicit tests based on risk.
- Changed behavior requires corresponding test evidence.
- Initial numeric thresholds will be calibrated after the first vertical slice and approved separately.
- Exclusions must be narrow, justified, and visible in configuration.
- Mutation testing may be evaluated later for the most critical domain rules.

## Rationale

Vitest aligns with the Vite-based TypeScript web stack and is suitable for fast tests across workspace packages. Testcontainers preserves production-relevant PostgreSQL semantics. Playwright supports isolated browser contexts for multi-user scenarios and multiple browser engines. axe integrates accessibility checks into those real browser flows. dependency-cruiser and ESLint provide complementary deep and fast enforcement of the accepted architecture.

## Consequences

### Positive

- One primary fast test runner across most TypeScript code.
- Integration tests exercise the actual database engine.
- Real multi-browser and two-user coverage.
- Automated architecture rules make boundaries executable.
- Accessibility evidence becomes part of ordinary delivery.
- Test artifacts can support the public development narrative.

### Negative

- Docker or a compatible container runtime is required for integration tests.
- Browser and container tests consume more time and CI resources than isolated tests.
- Several complementary tools require coordinated configuration and maintenance.
- Automated accessibility checks still require manual assessment.
- Multi-browser matrices require disciplined tiering to keep feedback timely.

## Required Repository Validation

The scaffold and first vertical slice must prove:

1. Vitest projects run domain, application, and React component tests;
2. Testcontainers starts the pinned PostgreSQL image and applies migrations;
3. integration tests isolate state and clean up deterministically;
4. Playwright controls two isolated browser contexts in one game;
5. Socket.IO reconnection and restart scenarios are observable and repeatable;
6. axe scans meaningful pages and interactive states;
7. dependency-cruiser and ESLint fail on intentional architecture violations;
8. reports and failure artifacts are retained by CI;
9. the fast local suite and broader CI suites have documented commands and expected durations.

Tool or configuration decisions may be reopened if this validation exposes instability, prohibitive execution cost, or unsupported integration.

## Evidence

- Vitest documents first-class TypeScript operation through Vite and configurable test selection.
- Testcontainers for Node.js provides a PostgreSQL module that exposes real container connection information.
- Playwright supports isolated and multiple browser contexts, multi-browser projects, traces, and test artifacts.
- Playwright documents integration with `@axe-core/playwright` while warning that automated accessibility testing detects only a subset of accessibility problems.
- dependency-cruiser supports configurable forbidden and required dependency rules for TypeScript module graphs.

Evidence was reviewed on 2026-08-19.

## AI Contribution

Codex proposed the layered toolchain and responsibility split, including real PostgreSQL tests, two-browser-context scenarios, architecture enforcement, and combined automated and manual accessibility verification.

## Human Approval

Yasmany approved the complete proposed toolchain and its ten associated rules on 2026-08-19.
