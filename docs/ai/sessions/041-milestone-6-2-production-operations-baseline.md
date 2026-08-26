# Session 041 — M6.2 Production Configuration and Operations Baseline

| Field        | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Date         | 2026-08-26                                                         |
| Milestone    | M6.2 — Production Configuration, Security, and Operations Baseline |
| Participants | Yasmany (decision owner), Codex (implementation assistant)         |
| Status       | Validated locally; pending human review                            |

## Approved Configuration Decisions

1. Caddy is the only public edge. It terminates HTTPS and routes the same origin to web, API, and Socket.IO.
2. PostgreSQL is externally managed in the reference deployment and is supplied only as `DATABASE_URL`.
3. Production uses secure, HTTP-only, `SameSite=Lax` session cookies and explicit proxy trust.
4. Identity routes are limited to 10 requests/minute/IP; game mutation routes are limited to 60 requests/minute/IP.
5. The operational contract includes JSON logs with request IDs, liveness/readiness endpoints, graceful shutdown, backup/restore, rollback, and incident guidance.

## Delivered

- Added validated API runtime configuration for database URL, origins, proxy trust, port, log level, and session security.
- Added security response headers, origin allow-listing, and bounded process-local rate limiting for the single-instance reference topology.
- Added runtime Docker targets for API and web, plus `compose.release.yaml` and Caddy configurations. The release Compose file requires a future operator to provide a domain, Caddy email, and externally managed database URL; none are committed.
- Changed browser API calls to support same-origin `/api` routing in release builds while retaining the existing development API origin.
- Added dependency audit and deterministic secret-pattern scanning to GitHub Actions.
- Added provider-neutral operations documentation, including observability requirements and pre-release security/backup/rollback/incident boundaries.

## Local Evidence

- API and web TypeScript checks passed.
- API and web lint passed.
- The secret baseline scanner passed against the project tree.
- The `release-build` Docker target passed with `VITE_API_URL=/api`.
- The isolated release-like Compose stack served both the web UI and `/api/ready` through Caddy at `http://127.0.0.1:8080`.
- The proxy response included the production security-header baseline.

## Explicit Limitations

- No real domain, certificate, managed PostgreSQL provider, deployment credentials, or public environment exists.
- The release Compose configuration cannot be started until an operator supplies those future deployment inputs.
- The rate limiter is process-local and must be replaced with a shared implementation before multiple API instances are used.
- The OWASP ASVS-oriented review is a practical baseline, not a certification or penetration test.

## Next Step

Review the release baseline, then move to M6.3 capacity and resilience evidence.
