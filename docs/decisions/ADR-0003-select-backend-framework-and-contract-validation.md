# ADR-0003: Select NestJS with Fastify and Zod

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

The project prefers TypeScript, Node.js, and React while prioritizing correct delivery, maintainability, and operational balance over learning a particular technology.

Backend candidates were NestJS with Fastify, direct Fastify composition, and AdonisJS. Runtime contract candidates were Zod, TypeBox, and Valibot.

The weighted evaluation scored direct Fastify slightly above NestJS with Fastify and Zod slightly above TypeBox. A comparative spike was proposed for the close decisions.

## Decision

Use:

- **NestJS** for backend delivery and application composition.
- The **Fastify platform adapter** rather than NestJS's default Express adapter.
- **Zod** for runtime validation of untrusted transport data and shared public contracts.

Do not execute the proposed comparative Fastify-versus-NestJS and Zod-versus-TypeBox spikes.

Exact package versions will be pinned to supported stable releases when the new repository is initialized.

## Rationale

Yasmany explicitly selected NestJS/Fastify and Zod after reviewing the evidence and weighted comparison. NestJS provides integrated dependency injection, application composition, testing support, and real-time adapters. Fastify provides the selected HTTP platform. Zod provides runtime validation, TypeScript inference, browser and Node.js compatibility, and a broad ecosystem.

## Boundary Rules

1. Domain entities and value objects cannot import NestJS, Fastify, Zod, or transport types.
2. NestJS modules and providers compose accepted business modules but do not replace ADR-0002 boundaries.
3. Fastify is a delivery adapter.
4. Zod schemas validate transport and shared public contracts; domain invariants remain implemented in the domain.
5. Shared schemas cannot expose repositories, persistence models, secrets, or private domain representations.
6. Automated architecture tests enforce these rules.

## Consequences

### Positive

- Integrated backend composition and dependency injection.
- Official Fastify and WebSocket adapter support.
- Consistent TypeScript across public contracts.
- Runtime validation in browser and backend.
- Mature framework and schema ecosystems.

### Negative

- NestJS decorators and framework conventions can spread into domain code without enforcement.
- Nest modules can be confused with business-module boundaries.
- Zod schemas may add client bundle weight compared with more modular alternatives.
- Comparative evidence between the closest candidates will not be produced.

## Validation

ADR-0001's mandatory experiments remain required. In particular, architecture-boundary, real-time capacity, durability, recovery, and reproducible-development evidence must include the selected NestJS/Fastify/Zod stack.

## AI Contribution

Codex researched current official documentation, proposed candidates and weighted criteria, scored the alternatives, recommended direct Fastify and Zod, and proposed comparative spikes. Yasmany instead selected NestJS with Fastify and Zod and declined the comparative spikes.

## Human Approval

Yasmany explicitly selected NestJS/Fastify and Zod on 2026-08-19.

## Follow-up Actions

1. Select the web framework mode.
2. Select database and data-access technologies.
3. Select the real-time protocol and adapter.
4. Select the chess-rules library.
5. Define architecture tests preventing framework leakage.
