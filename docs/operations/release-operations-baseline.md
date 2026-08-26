# Release Operations Baseline

| Field        | Value                                         |
| ------------ | --------------------------------------------- |
| Status       | Reference configuration; no provider selected |
| Scope        | Milestone 6.2                                 |
| Last updated | 2026-08-26                                    |

## Boundary

This document describes the portable initial production topology. It does not create a public deployment, domain, database, observability account, or credentials.

## Reference Topology

```text
Internet → Caddy (HTTPS) → Web container
                         → API container → managed PostgreSQL
```

- Caddy is the only public-facing service and terminates TLS for the selected domain.
- The web and API containers are private to the container network.
- PostgreSQL is externally managed and reachable only through `DATABASE_URL`.
- The first production topology has one API instance. The in-memory rate limiter is deliberately valid only for that topology; horizontal scaling requires a shared limiter.

`compose.release.yaml` is a reference deployment specification. It refuses to start without `DATABASE_URL`, `CHESS_AI_DOMAIN`, and `CADDY_EMAIL`. No credential values belong in version control.

## Configuration and Health

- Runtime configuration is parsed and validated at API startup.
- `GET /health` confirms that the API process is alive.
- `GET /ready` verifies database connectivity and returns `503` when the database is unavailable.
- Containers use health checks, while Caddy waits for the API and web services to become healthy.
- On `SIGTERM`, Nest closes the HTTP service, clears game timers, and closes the database pool.

## HTTP and Session Security

- Production cookies are `Secure`, `HttpOnly`, `SameSite=Lax`, and scoped to `/`.
- The API trusts forwarded client information only in the explicit production proxy topology.
- Browser and WebSocket origins are allow-listed with `WEB_ORIGINS`.
- API responses include content-type, framing, referrer, opener, permissions, CSP, and HTTPS transport-security headers.
- Identity creation/recovery is limited to 10 requests per minute per client IP. Joining or mutating a game is limited to 60 requests per minute per client IP.

## Observability Contract

The application emits JSON logs through Pino. HTTP completion logs contain request ID, method, route, status code, and duration. Error logs retain the request ID for correlation.

Before public release, a selected collector and dashboard provider must provide:

1. log retention and query by request ID;
2. API request-rate, latency, error-rate, readiness, and active-connection metrics;
3. trace propagation from edge to API and database where supported;
4. alerts for sustained readiness failures, elevated 5xx rate, and database connection errors.

## Backup, Restore, and Rollback

The chosen managed PostgreSQL service must provide encrypted backups and point-in-time recovery. Before a public release, operators must rehearse:

1. Restore a backup into an isolated database.
2. Point a non-public API instance to it and check `/ready`.
3. Verify a completed archive game and an active game state.

Rollback uses an immutable previous web/API image. Do not roll back database migrations without an approved migration-specific recovery plan; prefer forward fixes.

## Incident First Response

1. Confirm edge, web, API, and `/ready` status.
2. Find the affected request ID in structured logs.
3. Preserve logs and the deployed image digest before restarting anything.
4. Use the smallest safe mitigation: restart unhealthy instance, disable traffic, or roll back the image.
5. Record impact, timeline, cause, mitigation, and follow-up action.

## Security Review Baseline

The M6.2 baseline maps to OWASP ASVS-oriented concerns: HTTPS transport, secure session handling, access control through the server-authoritative game model, validation at HTTP boundaries, error correlation without exposing stack traces, security headers, rate limits, dependency audit, and committed-secret detection.

It is not a full ASVS certification. Accounts, multi-factor authentication, WAF selection, formal penetration testing, and a privacy/legal review remain explicit pre-release blockers.
