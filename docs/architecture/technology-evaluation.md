# Technology Stack Evaluation

## Document Control

| Field          | Value       |
| -------------- | ----------- |
| Status         | Accepted    |
| Version        | 1.0         |
| Decision owner | Yasmany     |
| Source         | Session 008 |

## Purpose

Compare coherent technology-stack candidates against accepted product, architecture, quality, operational, and learning goals using current primary-source evidence and targeted experiments.

## Preferences

### Primary Goal

Technology selection is not driven by a desire to learn or deepen a specific language or framework. The primary goal is to build the product correctly through the documented AI-assisted engineering process.

### Preferred Direction

- TypeScript across browser and backend.
- React for the web client.
- Node.js for the backend runtime.
- A balance between maturity, operational simplicity, productivity, and useful modern practices.

These are strong evaluation preferences rather than unverified final selections.

### Shared-Code Boundary

A shared TypeScript package may contain stable public DTOs, event schemas, identifiers, and runtime validation contracts. Browser code must not import backend domain entities, repositories, persistence types, secrets, or authoritative rule implementations.

## Candidate Stacks

## Backend Candidates

- NestJS using its Fastify platform adapter.
- Fastify with explicit application composition.
- AdonisJS.

Direct Express is not a primary candidate. Fastify provides a more modern low-level baseline, while NestJS can use Fastify as its HTTP platform.

## Web Candidates

- React with Vite and client-side routing.
- Next.js with React.
- React Router in framework mode.

## Runtime Contract Candidates

- Zod.
- TypeBox.
- Valibot.

TypeScript static types alone are insufficient for validating untrusted network data. Shared contracts require runtime schemas and derived or aligned TypeScript types.

## Evaluation Criteria

## Backend Criteria

| Criterion                                     | Weight |
| --------------------------------------------- | -----: |
| Fit with modules, ports, and domain           |    22% |
| Correctness, testing, and concurrency control |    18% |
| Real-time behavior and recovery               |    15% |
| Maturity and maintenance                      |    15% |
| Operational simplicity                        |    12% |
| Typing and contracts                          |     8% |
| Performance                                   |     5% |
| Portability                                   |     5% |

## Web Criteria

| Criterion                              | Weight |
| -------------------------------------- | -----: |
| Accessibility and internationalization |    20% |
| Separation from authoritative backend  |    15% |
| Real-time user experience              |    15% |
| Routing and data loading               |    12% |
| Performance and public pages           |    12% |
| Testing                                |    10% |
| Simplicity                             |    10% |
| Hosting portability                    |     6% |

## Runtime Contract Criteria

| Criterion                                 | Weight |
| ----------------------------------------- | -----: |
| Runtime validation correctness            |    25% |
| TypeScript types and developer experience |    20% |
| JSON Schema and OpenAPI capability        |    15% |
| Maturity and ecosystem                    |    15% |
| Browser bundle size                       |    10% |
| Framework integration                     |    10% |
| Portability and maintenance               |     5% |

All matrices use a one-to-five relative fit scale. Scores guide decisions but do not replace required experiments.

## Backend Evaluation

| Criterion                         |  Weight | NestJS + Fastify | Fastify composition | AdonisJS |
| --------------------------------- | ------: | ---------------: | ------------------: | -------: |
| Modules, ports, and domain        |      22 |                4 |                   5 |        3 |
| Correctness, testing, concurrency |      18 |                4 |                   4 |        4 |
| Real-time and recovery            |      15 |                5 |                   4 |        3 |
| Maturity and maintenance          |      15 |                5 |                   5 |        4 |
| Operational simplicity            |      12 |                3 |                   4 |        4 |
| Typing and contracts              |       8 |                4 |                   3 |        4 |
| Performance                       |       5 |                4 |                   5 |        4 |
| Portability                       |       5 |                4 |                   5 |        4 |
| **Weighted score / 100**          | **100** |         **83.6** |            **87.8** | **72.6** |

### Backend Interpretation

Direct Fastify composition scores highest because it allows domain and application boundaries to remain framework-independent while providing encapsulated technical plugins and strong performance. The project must supply explicit dependency composition, transaction management, architecture enforcement, and WebSocket integration.

NestJS provides the strongest integrated real-time and dependency-injection experience. Its risk is allowing decorators, framework modules, and providers to spread into domain code or be mistaken for business-module boundaries. It remains a credible option if a spike demonstrates clean isolation with acceptable ceremony.

AdonisJS provides an integrated backend and test experience but is more conventionally application-framework-centric. Its official SSE capability is useful for server-to-client delivery, while bidirectional game interaction still requires HTTP commands or separately evaluated WebSocket integration.

## Web Evaluation

| Criterion                    |  Weight | React + Vite SPA |  Next.js | React Router Framework |
| ---------------------------- | ------: | ---------------: | -------: | ---------------------: |
| Accessibility and i18n       |      20 |                4 |        4 |                      4 |
| Backend separation           |      15 |                5 |        3 |                      4 |
| Real-time experience         |      15 |                5 |        4 |                      5 |
| Routing and data loading     |      12 |                3 |        5 |                      5 |
| Performance and public pages |      12 |                3 |        5 |                      4 |
| Testing                      |      10 |                4 |        4 |                      4 |
| Simplicity                   |      10 |                4 |        3 |                      4 |
| Hosting portability          |       6 |                5 |        3 |                      4 |
| **Weighted score / 100**     | **100** |         **82.4** | **78.6** |               **85.4** |

### Web Interpretation

React Router Framework Mode provides typed routes, data APIs, code splitting, and a path across SPA, static, and server rendering. It can begin with client-oriented deployment while preserving an evidence-based path to render public history routes differently later.

Vite SPA is the simplest strict client/backend separation and remains a strong fallback. It requires independently assembling routing and data-loading conventions and may provide weaker initial public-history rendering.

Next.js has the strongest integrated server-rendering story, but its full-stack features overlap with the separately authoritative backend and increase deployment and caching concepts that are not currently required.

## Runtime Contract Evaluation

| Criterion                   |  Weight |      Zod |  TypeBox |  Valibot |
| --------------------------- | ------: | -------: | -------: | -------: |
| Runtime correctness         |      25 |        5 |        5 |        5 |
| TypeScript experience       |      20 |        5 |        4 |        5 |
| JSON Schema and OpenAPI     |      15 |        4 |        5 |        3 |
| Maturity and ecosystem      |      15 |        5 |        4 |        3 |
| Browser bundle size         |      10 |        3 |        4 |        5 |
| Framework integration       |      10 |        5 |        5 |        3 |
| Portability and maintenance |       5 |        5 |        5 |        4 |
| **Weighted score / 100**    | **100** | **93.0** | **91.0** | **83.0** |

### Runtime Contract Interpretation

Zod narrowly leads through mature TypeScript ergonomics, broad ecosystem, browser and Node.js use, and JSON Schema conversion. TypeBox is especially compelling if Fastify's JSON-Schema-native validation and OpenAPI generation dominate the decision. Valibot's main advantage is client bundle efficiency.

The Zod and TypeBox scores are close enough that integration should be validated in the backend spike rather than selected from score alone.

## Historical Preliminary Recommendations

- Backend: Fastify composition, subject to a comparison spike against NestJS with Fastify.
- Web: React Router Framework Mode, initially preserving strict authoritative-backend separation.
- Contracts: Zod, subject to a Zod-versus-TypeBox integration check in the backend spike.

These were the pre-selection recommendations. They are retained as historical evaluation evidence and were superseded by the approved selections below where they differ.

## Human Selection

On 2026-08-19, Yasmany selected:

- NestJS using the Fastify platform adapter for backend delivery and application composition.
- Zod for shared runtime contracts.
- React Router Framework Mode for the React web client.
- PostgreSQL for the primary transactional database.
- Kysely with the `pg` driver for PostgreSQL access, subject to a focused persistence experiment.
- Socket.IO through the official NestJS adapter for active-game real-time communication, subject to the mandatory real-time experiment.
- chess.js behind a project-owned rules port for standard-chess move and position rules, subject to authoritative compatibility tests.
- Vitest, React Testing Library, Testcontainers with PostgreSQL, Playwright, axe, dependency-cruiser, and ESLint import restrictions as a layered quality toolchain.
- A pnpm-workspace monorepo coordinated by Turborepo, with Node.js 24 LTS, PostgreSQL 18, strict TypeScript, ESLint, and Prettier.
- A complete Docker Compose development environment for database, migrations, server, web, hot reload, and container-executed tests.
- i18next and react-i18next for English, Spanish, and French web localization, with language-neutral server contracts and behavior.
- Pino structured logs, health and readiness endpoints, safe correlation, durable game audit evidence, and configuration-ready OpenTelemetry traces and metrics.

Yasmany chose not to run the proposed comparative Fastify-versus-NestJS and Zod-versus-TypeBox spikes. This decision does not cancel ADR-0001's five mandatory architecture-validation experiments.

The selection implies strict controls:

- NestJS decorators, providers, modules, and transport types remain outside domain entities and value objects.
- Nest modules may compose business modules but do not redefine their accepted ownership boundaries.
- Fastify remains a delivery adapter rather than a domain dependency.
- Zod schemas define untrusted transport and shared public contracts; domain invariants remain domain behavior.
- Shared schemas must not expose private backend representations.
- React Router loaders, actions, and rendering modes cannot become a second authoritative backend.
- PostgreSQL uses module-owned tables or logical schemas, atomic game/outbox transactions, and migration discipline without leaking persistence models into the domain.
- Kysely and `pg` remain confined to persistence adapters; exact stable versions and the migration workflow will be validated and pinned during repository creation.
- Socket.IO remains a delivery adapter. Commands are idempotent, server decisions are explicit, and reconnection always supports authoritative snapshot synchronization.
- chess.js remains isolated in a rules adapter. Project-owned behavior retains multiplayer lifecycle, clock, draw-claim, automatic-termination, persistence, and event responsibilities.
- Test scope is risk-based: real PostgreSQL backs integration tests, real browser contexts back multi-user flows, automated accessibility is supplemented manually, and coverage percentages do not replace behavioral evidence.
- The clean-checkout contributor path requires only Git and a supported Docker environment; frontend and backend development run inside hot-reloading containers.
- Third-party behavioral analytics is excluded from the MVP. Observability data uses explicit redaction, bounded metric labels, and provider-neutral export configuration.

## Verified Current Evidence

Evidence was collected on 2026-08-19 from official documentation and primary project repositories.

### Runtime

- The [Node.js release schedule](https://nodejs.org/en/about/previous-releases) identifies v24 as LTS and states that production applications should use Active LTS or Maintenance LTS releases. Exact runtime version will be pinned only when the repository is created.

### Backend

- [NestJS documentation](https://docs.nestjs.com/) confirms TypeScript support and HTTP abstraction over Express or Fastify.
- [NestJS WebSocket documentation](https://docs.nestjs.com/websockets/gateways) supports Socket.IO and `ws` through adapters, including custom adapters.
- [Fastify plugin documentation](https://fastify.dev/docs/latest/Reference/Plugins/) describes encapsulated plugin scopes forming a directed acyclic graph, which may assist technical composition but does not replace domain boundaries.
- [Fastify TypeScript documentation](https://fastify.dev/docs/latest/Reference/TypeScript/) provides TypeScript support while acknowledging that some API or plugin typing can be incomplete or incorrect.
- [AdonisJS documentation](https://docs.adonisjs.com/introduction) describes a backend-first, TypeScript, ESM, convention-oriented framework with integrated capabilities.
- [AdonisJS testing documentation](https://docs.adonisjs.com/guides/testing/introduction) provides its Japa-based unit, API, and browser testing setup.
- [AdonisJS Transmit documentation](https://docs.adonisjs.com/guides/digging-deeper/server-sent-events) provides an official SSE-based server-to-client real-time module. Bidirectional game commands would still use HTTP or require separately evaluated WebSocket support.

### Web

- The [React project guidance](https://react.dev/learn/creating-a-react-app) recommends starting new applications with a framework and identifies Next.js and React Router as supported directions. It also documents a from-scratch path using Vite when framework constraints do not fit.
- [React Router framework-mode documentation](https://reactrouter.com/start/modes) supports type-safe routes, code splitting, and SPA, SSR, or static rendering strategies.
- [Next.js documentation](https://nextjs.org/docs) defines it as a full-stack React framework with App Router and Pages Router options.
- [Vite production documentation](https://vite.dev/guide/build.html) produces static-hosting-ready bundles and also documents SSR as an available advanced path.

### Runtime Contracts

- The [Zod primary repository](https://github.com/colinhacks/zod) documents runtime parsing, TypeScript inference, modern browser and Node.js compatibility, JSON Schema conversion, zero dependencies, and a broad ecosystem.
- [Valibot documentation](https://valibot.dev/) emphasizes runtime validation, TypeScript inference, modular imports, and small browser bundles.
- [TypeBox documentation](https://sinclairzx81.github.io/typebox/) remains a candidate for JSON-Schema-oriented contracts; its exact integration and maintenance evidence requires a focused check before scoring.

## Evidence Limitations

- Documentation confirms supported capabilities, not suitability under this project's load and recovery requirements.
- Real-time behavior, architecture-boundary enforcement, chess-library integration, and local reproducibility still require experiments.
- Feature availability does not imply that a framework should own domain behavior.

## Closure and Follow-Up

This evaluation is accepted as the technology-selection evidence for Session 008. Its candidate scores and pre-selection recommendations are historical; the `Human Selection` section and ADR-0003 through ADR-0012 define the current selected baseline.

The remaining work is implementation validation, not further initial stack selection. Required evidence includes durable move confirmation, real-time capacity and recovery, chess-rule compatibility, architecture enforcement, reproducible containers, accessibility, internationalization, and safe observability.

Hosting, public legal terms, registered authentication, production observability providers, and horizontal scaling remain separately deferred decisions.
