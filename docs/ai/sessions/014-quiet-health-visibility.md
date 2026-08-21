# Session 014 — Quiet Health Visibility

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

Make a temporary application-connection failure visible to players without adding noise during normal operation or exposing operational details.

## Decision

| ID       | Decision                                                                                                                                       | Owner   | Status   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| S014-D01 | Show no health indicator when the application is ready; show a small, localized, non-technical notice only when readiness cannot be confirmed. | Yasmany | Accepted |

## Implementation

- The server-rendered public shell checks readiness before the initial page is sent, so the unavailable state is visible even when client-side JavaScript has not started or is stale.
- After enhancement, the public shell checks its same-origin readiness route every 30 seconds.
- The readiness route performs the server-side request to the internal API and returns only an HTTP success or failure status; it does not expose database, port, host, or exception details.
- A failed or timed-out readiness check shows a localized status notice that says the connection is temporarily unavailable and that the application will keep trying.
- A successful later check removes the notice automatically.
- The healthy state is intentionally silent.

## Verification and Evidence

| Check                         | Result                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| Local readiness route         | Passed: `http://127.0.0.1:5173/api/ready` returned HTTP 204                                         |
| Local-network readiness route | Passed: `http://192.168.0.12:5173/api/ready` returned HTTP 204                                      |
| Healthy browser state         | Passed: the rendered page had no connection notice                                                  |
| Simulated unavailable state   | Passed: a browser-only mocked readiness failure displayed the localized safe notice                 |
| Physical local-network check  | Passed: after stopping the API, the notice appeared on the phone; after restoration, it disappeared |
| Web unit test                 | Passed                                                                                              |
| Web TypeScript typecheck      | Passed                                                                                              |

## Next Step

Decide the minimum structured observability required for Milestone 1, without adding third-party tracking or collecting player data.
