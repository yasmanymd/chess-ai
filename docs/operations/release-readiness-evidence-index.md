# Release Readiness Evidence Index

| Field        | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Status       | M6.4 automated evidence complete; manual matrix remains open |
| Scope        | Future deployment readiness; not a launch                    |
| Last updated | 2026-08-27                                                   |

## Evidence Map

| Readiness area            | Evidence                                                                                      | Current state                          |
| ------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| CI and release build      | `.github/workflows/quality.yml`; sessions 039 and 040                                         | Passed on GitHub Actions run #4        |
| Production operations     | `compose.release.yaml`, `Caddyfile.release`, `docs/operations/release-operations-baseline.md` | Locally validated; provider-neutral    |
| Security baseline         | CI dependency/secret checks; headers, origin controls, rate limits; M6.2 operations baseline  | Baseline complete; not a certification |
| Capacity                  | `scripts/run-capacity-scenario.sh`, `docs/plan/milestone-6-3-capacity-resilience-plan.md`     | Passed locally: p95 21 ms              |
| Recovery and backup       | `scripts/run-resilience-drill.sh`, EXP-0003                                                   | Passed against disposable databases    |
| Automated browser quality | Playwright/Axe critical-route suite, including M6.4 locale and viewport coverage              | Passed locally: 3 Playwright tests     |
| Manual compatibility      | `docs/operations/manual-compatibility-matrix.md`                                              | Partially recorded; final matrix open  |
| Public-release materials  | `docs/operations/known-release-limitations.md`, development narrative outline                 | Drafted; decisions remain open         |

## Interpretation

This index distinguishes evidence that a local, containerized MVP can be evaluated from authorization to operate a public service. It must not be presented as a production launch checklist completion until every release blocker is resolved by Yasmany.
