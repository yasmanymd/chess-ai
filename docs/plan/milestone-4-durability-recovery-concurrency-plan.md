# Milestone 4 — Durability, Recovery, and Concurrency Plan

| Field          | Value                                               |
| -------------- | --------------------------------------------------- |
| Status         | Completed                                           |
| Milestone      | Milestone 4 — Durability, Recovery, and Concurrency |
| Date           | 2026-08-25                                          |
| Decision owner | Yasmany                                             |

## Objective

Make confirmed games survive delivery failures, server restarts, reconnecting browsers, and repeated or concurrent commands without losing, duplicating, or corrupting authoritative state.

## Approved Decisions

| ID     | Decision                                                                                                                          | Rationale                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| M4-D01 | A game remains active across a server restart; a configured clock continues from persisted server timestamps.                     | It preserves the same time-control contract independently of browser or process availability. |
| M4-D02 | Repeating the same client command ID returns its original confirmed result rather than applying another transition.               | Network retries become safe and predictable.                                                  |
| M4-D03 | Game-state changes and outbound notifications are stored in one transaction; a separate dispatcher retries notification delivery. | A confirmed state change cannot be separated from its delivery intent.                        |
| M4-D04 | Notifications are at-least-once hints only. A reconnecting client always refetches the authoritative snapshot.                    | Duplicate or missed Socket.IO delivery cannot corrupt browser state.                          |

## Delivery Slices

### M4.1 — Durable Command and Event Records — Completed 2026-08-25

Add a command ledger keyed by game and client command ID, plus an outbox record written in the same transaction as every confirmed move or lifecycle transition. Store enough public result data to replay an idempotent response safely.

**Evidence:** A transaction test proves that a move, its command result, and its outbox record either all persist or none persist.

**Implemented evidence:** `game_command_ledger` stores confirmed move and action responses by game and client command ID. `game_outbox` records a `game.updated` intent in the same database transaction as every confirmed move, game action, or server-detected timeout. Integration tests cover idempotent move/action replay and durable outbox records.

### M4.2 — Retry-Safe Outbox Dispatch — Completed 2026-08-25

Implement a lease-based dispatcher that publishes pending outbox records, records delivery attempts, and retries with bounded exponential backoff. Socket.IO remains non-authoritative and consumes only emitted notification facts.

**Evidence:** A simulated publication failure is retried without duplicating game state; duplicate notification delivery is harmless to the browser.

**Implemented evidence:** The server claims pending records with an expiring lease, increments delivery attempts, publishes the notification, and marks the record delivered only after publication succeeds. A failure clears the lease and schedules bounded exponential-backoff retry. Startup and periodic sweeps resume pending delivery.

### M4.3 — Restart and Reconnection Recovery — Completed 2026-08-25

On server startup, resume pending outbox dispatch. On client reconnect or regained visibility, refetch the game snapshot and reconcile it without page-level state loss. Persisted clock timestamps determine the current server-authoritative remaining time.

**Evidence:** Restart and reconnect experiments restore the same position, move history, result, and clock outcome.

**Implemented evidence:** Server startup resumes pending outbox delivery. Game and lobby routes refetch their loaders when Socket.IO reconnects or when a hidden browser tab becomes visible; periodic reconciliation remains a fallback for a missed notification. Existing persisted `turn_started_at` clock calculation continues across process restarts.

### M4.4 — Concurrency and Rules Completion — Completed 2026-08-25

Harden competing commands with the command ledger and version checks. Complete required draw-claim and automatic-termination reference cases, including repetition and move-count behavior through the rules boundary.

**Evidence:** Repeated and concurrent commands produce one accepted transition; required FIDE fixtures pass.

**Implemented evidence:** Transactions lock the game before consulting the command ledger, so concurrent same-command retries return one recorded result and persist one move. Confirmed move history is replayed through the rules port to close a game automatically on fivefold repetition; the existing rules boundary also supplies the automatic 75-move condition.

### M4.5 — Exit Validation — Completed 2026-08-25

Run container, unit, integration, failure-injection, browser/mobile, accessibility, localization, and architecture checks. Publish a concise validation session identifying the remaining release risks for M5 and M6.

**Implemented evidence:** Server and web TypeScript checks, server lint, web lint, dependency-cruiser architecture validation, server unit tests, database integration tests, durable-command/outbox failure injection, Prettier verification for the M4 scope, and the rebuilt Playwright accessibility E2E test all pass. The final results are recorded in Session 031.

## Explicitly Deferred

- Registered accounts, account-based authorization, and cross-device account recovery.
- Guaranteed external message-bus delivery; the M4 outbox delivers only the project’s current in-process real-time notification boundary.
- High-availability multi-region deployment.
