# Milestone 6.3 — Capacity and Resilience Plan

| Field          | Value      |
| -------------- | ---------- |
| Status         | Complete   |
| Date           | 2026-08-26 |
| Decision owner | Yasmany    |

## Objective

Produce repeatable, local evidence for the accepted MVP target without representing one developer machine as production capacity.

## Approved Test Contract

| Concern           | Approved behavior                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Topology          | One API instance, release-like Docker Compose configuration, disposable PostgreSQL database, and local Caddy edge.                             |
| Concurrency       | Create 100 active games and keep 500 authenticated Socket.IO clients connected.                                                                |
| Activity          | Distribute legal, alternating moves across the games for five minutes.                                                                         |
| Command success   | Valid move commands must have fewer than 1% errors.                                                                                            |
| Latency           | Server-confirmed valid move processing must have p95 below 100 ms, measured at the load client and reported as an environment-specific result. |
| Recovery          | Restart the API during an active game; reconnect participants; verify authoritative position, move history, turn, status, and clock state.     |
| Database recovery | Create and restore a backup against a disposable local database only. No development or future production database is included.                |

## Experiment Design

1. Start an isolated Compose project with an ephemeral database and release-like API/web/Caddy containers.
2. Create 200 temporary identities and pair them into 100 active games.
3. Connect 500 authenticated Socket.IO clients: two player sessions per game plus 300 additional authenticated sessions distributed among existing identities.
4. Submit legal moves sequentially within each game, while games run concurrently.
5. Capture total requests, successful moves, rejected or failed commands, latency percentiles, open connections, elapsed time, host/Docker resource observations, and the source revision.
6. Write a versioned JSON report under `artifacts/capacity/`; generated reports remain ignored by Git unless deliberately attached as evidence.

## Pass and Interpretation Rules

The run passes only if the setup completes, 500 connections remain established during the observation interval, valid-move error rate remains below 1%, and p95 move latency remains below 100 ms. A failure does not invalidate the product; it records the hardware context, observed limit, and a mitigation decision before any public capacity claim.

## Implementation Evidence

On 2026-08-26, the isolated minimal capacity smoke scenario passed with one active game, two authenticated Socket.IO connections retained at measurement time, zero valid-move errors, and a 14 ms p95 client-observed move latency. The automated resilience drill also passed: it created and restored a custom-format PostgreSQL backup into a second disposable database, restarted the API, reconnected both player sessions, and verified the authoritative snapshot and clocks.

The full on-demand run completed on 2026-08-27 in five minutes with 100 active games, 500 connected Socket.IO clients retained at measurement time, 1,100 accepted valid moves, zero move errors, and zero socket disconnects. Its client-observed p50 was 172 ms and p95 was 297 ms. The error-rate target passed, but the approved p95 target of less than 100 ms did not. This host-specific result is recorded as a failed latency target, not a release claim. A mitigation decision is required before M6.3 can close.

Yasmany approved the initial mitigation on 2026-08-27. Increasing the isolated PostgreSQL pool from its normal default of 10 to 50 connections produced a 306 ms p95 and was rejected as ineffective. The server retains the validated configuration field and normal default of 10.

The next repeat keeps the duration, 100 games, 500 connections, and per-game 27-second move cadence unchanged, but spreads the 100 moves across each cadence interval. The prior synchronized burst was not an approved part of the active-game contract. The next comparable five-minute run remains the acceptance evidence.

The valid corrected run completed on 2026-08-27. It retained 500 authenticated Socket.IO connections across 100 games for five minutes, accepted all 1,100 legal moves, and recorded zero valid-command errors and zero socket disconnects. Client-observed move latency was 15 ms p50 and 21 ms p95, which passes the accepted p95-below-100-ms target. The API restart, reconnect, backup, and restore drill was rerun after the final changes and passed its complete authoritative-state comparison.

## Boundaries

- This experiment does not model Internet latency, DDoS, multi-region traffic, or multiple API instances.
- A local computer result is evidence for reproducibility and a baseline, not a production service-level guarantee.
- Load testing is on-demand and is excluded from ordinary GitHub Actions runs.
