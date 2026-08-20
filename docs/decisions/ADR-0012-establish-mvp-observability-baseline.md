# ADR-0012: Establish the MVP Observability Baseline

## Metadata

| Field | Value |
|---|---|
| Status | Accepted, subject to repository validation |
| Date | 2026-08-19 |
| Decision owner | Yasmany |
| AI contributor | Codex |
| Related session | Session 008 |
| Related decisions | ADR-0003, ADR-0007, ADR-0009, and ADR-0010 |

## Context

An authoritative multiplayer system requires enough operational evidence to diagnose rejected commands, reconnection problems, persistence failures, clock discrepancies, and unexpected restarts. Observability must be useful in local containers and compatible with future hosting, without prematurely selecting a commercial provider or collecting unnecessary personal data.

## Decision

Establish the following provider-neutral MVP observability baseline:

1. Structured JSON application logs using **Pino**, integrated with NestJS.
2. Liveness and readiness endpoints at `/health` and `/ready`.
3. Stable, safe HTTP and Socket.IO error codes with correlation identifiers.
4. Durable audit evidence for material game actions through project events and the transactional outbox, separate from operational logs.
5. Configuration-ready **OpenTelemetry** tracing and metrics, initially disabled unless an explicit local or deployment configuration enables an exporter.
6. No third-party product analytics or behavior-tracking service in the MVP.

No log, metric, trace, or error payload may contain secrets, credentials, session tokens, raw IP addresses, unfiltered request bodies, or user-generated content unless a later approved privacy policy permits a precisely justified exception.

## Logging Rules

1. Logs are structured JSON outside a developer-friendly local presentation mode.
2. Each inbound HTTP request and Socket.IO command receives or propagates a correlation identifier.
3. Relevant safe context includes service, environment, operation, outcome, duration, game identifier, command identifier, and anonymized or internal actor identifier where necessary for diagnosis.
4. Display names, untrusted payloads, PGN comments, translation values, authentication material, and database connection strings are excluded or redacted.
5. Error logs include a safe error code and causal context; they do not expose stack traces or internal details to clients.
6. Log levels and sampling are configurable by environment.
7. Logs are operational evidence, not the authoritative history or audit record of a chess game.

## Metrics and Traces

1. Initial metrics include request and command duration, error totals, accepted and rejected game commands, active Socket.IO connections, reconnection attempts, game duration, migration status, and readiness state.
2. Metric labels must have bounded cardinality; no player names, command IDs, game IDs, raw routes, or unbounded error text may become metric labels.
3. Traces link HTTP, Socket.IO, application, persistence, and outbox work when instrumentation is enabled.
4. OpenTelemetry exporters, collectors, retention, dashboards, alerting, and vendor choice are deferred deployment decisions.
5. OpenTelemetry logs are not adopted for the MVP because the JavaScript logs signal remains in development; Pino JSON logs are the reliable baseline.

## Error and Health Rules

1. `/health` reports basic process liveness without disclosing sensitive dependency details.
2. `/ready` verifies dependencies needed to accept authoritative traffic, including database reachability and migration readiness.
3. HTTP and Socket.IO failures expose stable public error codes and the correlation identifier, not internal exception messages.
4. Client-facing error codes map to the localization approach in ADR-0011.
5. Health endpoints, log correlation, and basic metrics are exercised in container and integration tests.

## Privacy Rule

No third-party analytics, session replay, advertising, or behavioral profiling tool is included in the MVP. Any future product analytics proposal requires a separately approved purpose, data inventory, retention plan, user disclosure, and privacy decision.

## Validation

The first vertical slice must prove:

1. structured server logs with correlation through an HTTP request and a Socket.IO command;
2. redaction tests for known sensitive fields;
3. safe and localized client error presentation from stable error codes;
4. `/health` and `/ready` behavior before and after database readiness;
5. bounded metric-label configuration;
6. a local configuration path that emits or inspects a representative trace and metric;
7. durable game audit evidence independent of logs;
8. no analytics SDK or tracking request appears in browser network tests.

## Rationale

Pino provides efficient structured logs and integrates with NestJS through its custom logger mechanism. OpenTelemetry supplies a vendor-neutral standard for traces and metrics while allowing deployment tooling to remain undecided. Separating durable game events from logs avoids treating ephemeral operational output as business truth. The privacy boundary is appropriate for a public educational MVP with temporary player identity.

## Consequences

### Positive

- Problems are diagnosable locally and in a future hosted environment.
- The system has health checks suitable for container orchestration.
- Logs, metrics, and traces have clear responsibilities.
- Privacy risk is constrained by explicit data rules.
- Future provider selection remains portable.

### Negative

- Correlation and redaction add implementation work from the first slice.
- Metrics and traces require careful cardinality and exporter configuration.
- No hosted dashboard or alerting exists until a deployment decision is made.
- The absence of analytics limits product-usage insight during the MVP.

## Evidence

- NestJS documents JSON logging and custom logger integration, identifying Pino as a common high-performance choice.
- OpenTelemetry JavaScript documents traces and metrics as stable and logs as development status, and supports Node.js instrumentation and exporters.

Evidence was reviewed on 2026-08-19.

## AI Contribution

Codex proposed the provider-neutral Pino, health, error-code, OpenTelemetry, and privacy baseline, including explicit redaction and metric-cardinality controls.

## Human Approval

Yasmany approved trying the proposed observability approach on 2026-08-19.
