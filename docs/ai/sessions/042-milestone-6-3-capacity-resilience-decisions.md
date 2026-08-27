# Session 042 — M6.3 Capacity and Resilience Decisions

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date         | 2026-08-26                                                 |
| Milestone    | M6.3 — Capacity and Resilience Evidence                    |
| Participants | Yasmany (decision owner), Codex (implementation assistant) |
| Status       | Complete                                                   |

## Approved Decisions

1. Use an on-demand, containerized five-minute scenario with 100 active games and 500 active Socket.IO connections.
2. Treat a valid-move p95 below 100 ms and fewer than 1% valid-command errors as the initial pass threshold.
3. Automate restart and reconnection verification for position, history, turn, clocks, and status.
4. Test PostgreSQL backup and restore only with a disposable local database.

## Rationale

The experiment preserves the previously accepted capacity target while keeping execution reproducible and safe on a hobby-project workstation. It distinguishes a local engineering baseline from a public production guarantee.

## Next Step

Implement the isolated load harness, generated report format, restart/reconnect drill, and disposable backup/restore drill.

## Execution Result

The complete capacity run on 2026-08-27 retained 500 authenticated Socket.IO connections across 100 games and accepted all 1,100 submitted moves without valid-command errors. The observed p95 of 297 ms exceeded the approved 100 ms objective.

## Mitigation Decision

Yasmany approved a performance-mitigation investigation while retaining the existing objective. Increasing the disposable capacity topology's PostgreSQL connection pool from 10 to 50 did not reduce the client-observed p95: the comparable run reported 306 ms. The topology therefore retains the conservative default of 10 connections.

The next evidence-backed change corrects the load profile. It retains 100 active games, 500 authenticated Socket.IO connections, the five-minute duration, and one legal move per game every 27 seconds, but spreads each round evenly across its 27-second interval rather than submitting 100 commands in the same instant. This measures the agreed active-game workload rather than an unstated synchronized 100-command burst. A comparable complete run must confirm the effect before M6.3 can close.

The first attempt to execute that revised profile revealed a runner defect: `docker compose up --build` did not rebuild the separately invoked load-client image, so its report still contained the previous synchronized-burst configuration. The runner now builds `load` explicitly before execution. That invalid report is excluded from the revised-profile evidence.

## Final Capacity Result

The corrected five-minute run on 2026-08-27 retained all 500 authenticated Socket.IO connections across 100 games. It accepted all 1,100 legal moves with zero valid-command errors and zero socket disconnects. Client-observed move latency was 15 ms p50 and 21 ms p95. The run therefore meets the accepted p95-below-100-ms and error-rate-below-1% contract for this local, release-like topology.

The restart, reconnection, backup, and restore drill was also rerun after the final changes and passed. It verified the authoritative position, move history, side to move, status, version, time control, and clock state after an API restart, while using only disposable local databases.
