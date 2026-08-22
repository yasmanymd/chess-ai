# Session 015 — Initial Structured Observability

## Session Metadata

| Field             | Value                                  |
| ----------------- | -------------------------------------- |
| Date              | 2026-08-21                             |
| Status            | Completed                              |
| Human participant | Yasmany                                |
| AI collaborator   | Codex                                  |
| Working language  | Spanish                                |
| Artifact language | English                                |
| Milestone         | Milestone 1 — Public Application Shell |

## Objective

Complete the initial operational evidence needed for the public shell without introducing third-party tracking, player-data collection, or a hosted telemetry provider.

## Decision

| ID       | Decision                                                                                                                      | Owner   | Status   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| S015-D01 | Use structured server logs and safe correlation identifiers; do not add external analytics or player tracking in Milestone 1. | Yasmany | Accepted |

## Implementation

- Pino records a structured entry for every completed HTTP request.
- Each entry contains only the request identifier, HTTP method, matched route template, status code, and rounded duration.
- The server returns the same request identifier in the `x-request-id` response header.
- Client-visible failures remain safe and localized. Exception details stay in operational logs rather than the public interface.
- The public shell retains its readiness behavior and safe unavailable-state notice.
- No analytics SDK, session replay, advertising, external telemetry collector, player name, request body, credential, raw IP address, or unbounded route value is added to telemetry.

## Verification and Evidence

| Check                       | Result                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Local liveness request      | Passed: a request to `/health` returned a structured Pino entry with request ID, route, status, and duration |
| Correlation header          | Passed: the liveness response included `x-request-id` matching the log entry                                 |
| Server unit test            | Passed after separating unit discovery from Docker-backed integration discovery                              |
| Server TypeScript typecheck | Passed                                                                                                       |
| Web unit test               | Passed                                                                                                       |
| Web TypeScript typecheck    | Passed                                                                                                       |

## Scope Boundary

This completes the initial Milestone 1 observability implementation. The broader ADR-0012 validation—Socket.IO correlation, durable game audit evidence, redaction tests, metrics, traces, and provider configuration—belongs to later vertical slices when those capabilities exist.

## Next Step

Run the complete Milestone 1 exit validation and decide whether the public shell is ready to close before beginning temporary identity and the public lobby.
