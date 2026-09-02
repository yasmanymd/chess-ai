# Milestone 6: Ready Is Not Released

There is a dangerous sentence in software: “It works on my machine.” The more dangerous version is “It is ready to launch,” when no one has decided where it will run, who will operate it, or what the legal promises should be.

Milestone 6 made a different claim for Chess AI: the project could be evaluated for future deployment. It did **not** create an account with a hosting provider, buy a domain, expose the application publicly, or pretend that those decisions had been made.

## Make quality repeatable before making it public

The first artifact was a GitHub Actions workflow. On pushes, pull requests, and manual runs, it installs the pinned runtime and checks formatting, linting, TypeScript, architecture boundaries, unit tests, PostgreSQL integration, browser accessibility, and a reproducible Docker release build.

The first remote run failed. `pnpm/action-setup` tried to self-install under assumptions that did not hold on the runner, and the release build exposed a server compilation issue. Those failures were valuable evidence, not embarrassment. We removed the hidden installer dependency, aligned CI with the explicitly pinned pnpm version used by Docker, corrected the build issue, and recorded the correction. The fourth workflow run passed every job.

That sequence is exactly why CI exists: not to display a green badge, but to discover what the local environment had silently forgiven.

## A production shape without a production provider

We documented a portable reference topology: web and API containers, externally managed PostgreSQL, and one API instance behind Caddy. Caddy will terminate HTTPS when a future operator provides a domain, certificate-authority e-mail, and managed database URL. None of those inputs are committed.

An isolated release-like Compose experiment built the real runtime images, ran migrations against disposable PostgreSQL, and served the UI and `/api/ready` through Caddy on local HTTP. It also checked the edge security-header baseline. That proves configuration coherence; it is not a claim of public HTTPS validation, because a real domain does not yet exist.

The milestone also recorded provider-neutral operations needs: structured logs, metrics and traces, correlation, backup and restore, rollback, incident response, rate limiting, dependency and secret checks, and an OWASP ASVS-oriented review. Choosing a vendor belongs to the person who will own the operational bill and risk.

## Capacity is a scenario, not a slogan

The agreed local experiment targeted 100 simultaneous games and 500 authenticated Socket.IO connections for five minutes. The first load profile accidentally created a synchronized burst of 100 commands. Rather than presenting that as the intended workload, the team corrected the runner to spread moves through each 27-second round and explicitly rebuilt the separate load-client image.

The corrected run retained all 500 connections, accepted 1,100 legal moves, recorded zero valid-command errors and zero disconnects, with 15 ms p50 and 21 ms p95 client-observed latency. Under documented local conditions, it met the accepted contract. That is evidence for a baseline, not a prediction of global internet traffic.

## Evidence has an audience

Release readiness also meant verifying how humans encounter the app: critical journeys in English, Spanish, and French; Chrome and Safari; desktop and phone; plus automated accessibility checks. The documentation makes the missing evidence visible too: manual Firefox and Edge validation remain blockers for a public release.

The same is true for legal and operational choices. License, privacy disclosure, terms, hosting provider, domain, real HTTPS, production observability, multi-instance delivery, and scaling are not hidden in a backlog. They are named blockers.

At the end of M6, Chess AI was ready to be evaluated for deployment—not deployed. That distinction is an act of engineering honesty. A release is not a Docker image that builds; it is a commitment to users, operations, security, and consequences.

## Sources from the build log

- [Milestone 6 plan](../plan/milestone-6-release-readiness-plan.md)
- [Session 038: readiness planning](../ai/sessions/038-milestone-6-release-readiness-planning.md)
- [Session 039: CI and reproducible build](../ai/sessions/039-milestone-6-1-ci-and-release-build.md)
- [Session 040: first CI correction](../ai/sessions/040-milestone-6-1-first-ci-run-correction.md)
- [Session 041: production operations baseline](../ai/sessions/041-milestone-6-2-production-operations-baseline.md)
- [Session 042: capacity and resilience](../ai/sessions/042-milestone-6-3-capacity-resilience-decisions.md)
- [Session 043: release evidence](../ai/sessions/043-milestone-6-4-release-evidence.md)
