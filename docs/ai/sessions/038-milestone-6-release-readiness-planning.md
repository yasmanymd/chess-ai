# Session 038 — Milestone 6 Release Readiness Planning

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date         | 2026-08-26                                                 |
| Milestone    | Milestone 6 — Release Readiness                            |
| Participants | Yasmany (decision owner), Codex (implementation assistant) |
| Status       | Accepted                                                   |

## Objective

Interview Yasmany and create an initial delivery plan for deployment readiness without performing a public deployment.

## Decisions Captured

| ID | Decision | Owner | Status |
| --- | --- | --- |
| S038-D01 | M6 prepares for a future deployment only. It will not create a real hosting account, domain, infrastructure, or public release. | Yasmany | Accepted |
| S038-D02 | GitHub Actions is the CI provider; it validates quality and builds but does not deploy. | Yasmany | Accepted |
| S038-D03 | License, privacy disclosure, and terms remain deferred and become documented blockers before any public production deployment. | Yasmany | Accepted |
| S038-D04 | Observability is provider-neutral: instrument and document the required signals now, select the collector, dashboards, alerts, and retention later. | Yasmany | Accepted |
| S038-D05 | The portable reference topology uses web and API containers, externally managed PostgreSQL, one API instance, and Caddy as HTTPS edge proxy. | Yasmany | Accepted |
| S038-D06 | The capacity target remains 100 simultaneous games and 500 active connections; run it on demand in containers and retain a local report. | Yasmany | Accepted |
| S038-D07 | The security baseline includes dependency/secret checks, security headers, rate limits, and OWASP ASVS-oriented review. | Yasmany | Accepted |
| S038-D08 | Manual evidence covers Chrome and Safari across desktop/phone and English/Spanish/French. Firefox and Edge remain explicitly pending. | Yasmany | Accepted |

## Rationale

Yasmany has no selected deployment provider. Treating this milestone as a public launch would require credentials, operational authority, and legal decisions that are intentionally unavailable. A provider-neutral readiness milestone preserves the ability to evaluate a future deployment while keeping those decisions visible and human-controlled.

## Next Step

Yasmany approved the M6 delivery plan on 2026-08-26. Begin M6.1 CI and reproducible release-build implementation.
