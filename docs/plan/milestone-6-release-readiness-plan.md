# Milestone 6 — Release Readiness Plan

| Field          | Value                           |
| -------------- | ------------------------------- |
| Status         | Accepted                        |
| Milestone      | Milestone 6 — Release Readiness |
| Date           | 2026-08-26                      |
| Decision owner | Yasmany                         |

## Objective

Produce reproducible technical and operational evidence that Chess AI can be evaluated for future public deployment. This milestone prepares for deployment but does not select a hosting provider, acquire a domain, create production infrastructure, or deploy the application publicly.

## Approved Decisions

| ID     | Decision                      | Approved behavior                                                                                                                                                                                               |
| ------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M6-D01 | Delivery scope                | Prepare for deployment only. Do not create a real public deployment because no provider has been selected.                                                                                                      |
| M6-D02 | Continuous integration        | Use GitHub Actions to run quality checks and build validation on repository changes; no automatic deployment workflow.                                                                                          |
| M6-D03 | Legal release materials       | Defer the repository license, privacy disclosure, and terms. Record them as blocking decisions before any public production release.                                                                            |
| M6-D04 | Observability                 | Keep instrumentation provider-neutral. Define structured logs, metrics, traces, correlation, and future collector/dashboard/alert requirements without selecting a provider.                                    |
| M6-D05 | Reference topology            | Document a portable initial topology: web container, API container, managed PostgreSQL, and one API instance behind an HTTPS proxy. Horizontal scaling remains deferred.                                        |
| M6-D06 | HTTPS                         | Use Caddy as the reference edge proxy. At future deployment it terminates TLS using a domain and an automated certificate authority; local development remains HTTP.                                            |
| M6-D07 | Capacity experiment           | Automate the accepted 100 simultaneous-game / 500 active-connection scenario as an on-demand containerized experiment with a local report. Do not run it on every pull request.                                 |
| M6-D08 | Security baseline             | Add dependency and secret checks in CI, relevant HTTP security headers, rate limiting for public or sensitive endpoints, and a documented OWASP ASVS-oriented review. Accounts and a WAF remain out of scope.   |
| M6-D09 | Manual compatibility evidence | Record critical-journey validation for English, Spanish, and French on desktop and phone using Chrome and Safari. Firefox and Edge manual testing remain explicitly pending while automated coverage continues. |

## Delivery Slices

### M6.1 — CI and Reproducible Release Build — Accepted and validated

**Outcome:** Every repository change can be validated in GitHub Actions without deploying.

- Add a GitHub Actions workflow for dependency installation, formatting, type checks, lint, architecture checks, unit tests, integration tests, E2E checks, and production-build validation. Runtime production images are delivered with the M6.2 reference topology.
- Cache dependencies safely and publish readable check summaries or artifacts when useful.
- Document the required Docker-compatible CI runtime and the deliberate absence of deployment credentials.

**Evidence:** A pull request or branch workflow runs the release-quality checks and proves the production images build without secrets.

**Validated evidence:** GitHub Actions run #4 completed successfully on 2026-08-26. Static-quality, PostgreSQL integration, browser accessibility, and reproducible release-build jobs all passed. The workflow has no deployment step or credentials.

### M6.2 — Production Configuration, Security, and Operations Baseline — Implemented and locally validated

**Outcome:** The application has an explicit provider-neutral production configuration and a documented operational boundary.

- Add a reference Caddy configuration and compose/deployment specification that routes HTTPS traffic to web and API containers while PostgreSQL is externally managed.
- Make production proxy trust, secure cookies, allowed origins, configuration validation, health checks, and shutdown behavior explicit.
- Add safe HTTP security headers, bounded rate limiting, dependency/secret scanning, and an OWASP ASVS-oriented review record.
- Document structured logging, metrics/traces interfaces, correlation, collection requirements, operational dashboards, alert candidates, backup/restore procedure, rollback procedure, and incident runbook.

**Evidence:** A local production-like container experiment passes health and HTTPS-proxy configuration checks without exposing credentials or treating it as a public deployment.

**Validated evidence:** On 2026-08-26, an isolated Docker Compose experiment built the release API and web images, ran migrations against a disposable PostgreSQL database, and served the web UI plus `/api/ready` through Caddy at `http://127.0.0.1:8080`. The response carried the configured edge security-header baseline. Formatting, linting, type checking, architecture checks, unit tests, and secret scanning passed locally. This is an HTTP-only local proxy experiment; real HTTPS validation remains contingent on a future domain and provider.

### M6.3 — Capacity and Resilience Evidence

**Outcome:** The accepted initial capacity target is tested reproducibly and recovery limits are documented.

- Add an on-demand, containerized load scenario for 100 simultaneous games and 500 active connections.
- Capture a versioned local report with throughput, latency, error rate, active connections, resource observations, and machine constraints.
- Re-run restart, reconnect, backup, and restore drills against the release-like configuration.

**Evidence:** The target either passes under documented conditions or produces an explicit, human-approved revised target and mitigation plan.

### M6.4 — Cross-Browser, Accessibility, and Release Evidence — Accepted and validated

**Outcome:** A candidate release has a complete evidence index, known limitations, and public development narrative material.

- Extend automated accessibility and responsive checks for critical routes.
- Record the approved manual compatibility matrix across locales, desktop, phone, Chrome, and Safari.
- Publish a concise release-readiness evidence index, known-limitations record, and development-process narrative outline suitable for future blog posts.

**Evidence:** Exit evidence is complete, release blockers are explicit, and Yasmany accepts the readiness assessment.

**Validated evidence:** On 2026-08-27, the five-check Playwright/Axe release-evidence suite passed. Yasmany also confirmed the French critical journeys in Chrome desktop, Safari desktop, and iPhone Safari. Firefox and Edge remain visible future public-release blockers.

## Explicitly Deferred

- Selecting or operating a hosting provider, domain, DNS, production account, production database, or production observability service.
- Public deployment, real credentials, payments, or a release announcement.
- Software license, privacy disclosure, and terms of service.
- Registered accounts, social moderation, WAF selection, multi-instance game delivery, and horizontal scaling.
- Manual Firefox and Edge browser evidence until the environments are available.

## Exit Criteria

1. GitHub Actions validates the release-quality workflow and production images without deployment.
2. Provider-neutral production, HTTPS, security, backup/restore, rollback, observability, and incident materials are complete and tested where possible locally.
3. The capacity experiment records evidence for the 100-game / 500-connection target or an explicitly approved revision.
4. Critical user journeys have automated and recorded manual evidence for the approved browsers, locales, and responsive viewports.
5. The evidence index and known limitations distinguish readiness from an actual public release, and unresolved legal/provider decisions remain visible blockers.
