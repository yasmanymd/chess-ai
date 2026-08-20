# ADR-0004: Select React Router Framework Mode

## Metadata

| Field            | Value       |
| ---------------- | ----------- |
| Status           | Accepted    |
| Date             | 2026-08-19  |
| Decision owner   | Yasmany     |
| AI contributor   | Codex       |
| Related session  | Session 008 |
| Related decision | ADR-0003    |

## Context

The web client must support real-time chess, public history, replay, PGN import, three languages, WCAG 2.2 AA, responsive browsers, and strict separation from the authoritative NestJS backend.

Candidates were React with a Vite SPA, Next.js, and React Router Framework Mode. The weighted evaluation scored React Router Framework Mode highest.

## Decision

Use **React Router Framework Mode** for the React web client.

The initial implementation will preserve strict separation from the NestJS backend. Rendering strategy may begin client-oriented and use static or server rendering for suitable public routes only when evidence justifies it.

## Boundary Rules

1. NestJS remains the only authoritative application backend.
2. Frontend loaders, actions, and server-rendering capabilities must not duplicate chess, identity, clock, or persistence rules.
3. Shared packages contain public Zod contracts and types, not backend domain entities.
4. Real-time updates reconcile against authoritative backend state.
5. A change in rendering strategy cannot silently create a second business backend.

## Rationale

React Router Framework Mode provides typed routing, data APIs, code splitting, and SPA, static, and server-rendering options while retaining Vite-based tooling. It fits the separated web-client architecture and leaves a measured path for public-page rendering improvements.

## Consequences

### Positive

- Typed route and data conventions.
- Strong fit for interactive real-time UI.
- Flexible rendering strategies.
- Vite-based development and build tooling.
- Less full-stack overlap than adopting Next.js as another application backend.

### Negative

- Rendering and deployment mode still require an explicit implementation decision.
- Framework server features could blur the backend boundary without tests and conventions.
- Some hosting choices differ depending on SPA, static, or server rendering.

## Validation

- Demonstrate reproducible build and local startup.
- Verify public and authenticated route behavior.
- Verify accessible real-time board behavior.
- Verify Zod contract consumption and backend reconciliation.
- Evaluate public-history rendering with performance evidence before adding SSR.

## AI Contribution

Codex researched current React guidance, compared Vite SPA, Next.js, and React Router Framework Mode, and recommended React Router Framework Mode. Yasmany approved the recommendation.

## Human Approval

Yasmany accepted React Router Framework Mode on 2026-08-19.
