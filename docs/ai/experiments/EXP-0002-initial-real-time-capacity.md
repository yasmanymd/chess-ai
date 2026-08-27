# EXP-0002: Initial Real-Time Capacity

| Field            | Value                  |
| ---------------- | ---------------------- |
| Status           | Passed                 |
| Owner            | AI implementation team |
| Decision owner   | Yasmany                |
| Related decision | ADR-0001               |

## Hypothesis

The selected single-backend topology can support 500 active connections and 100 simultaneous games while preserving correctness and accepted latency.

## Success Criteria

- No game-state corruption or confirmed-move loss.
- Server move processing meets the accepted p95 target.
- Opponent updates satisfy the accepted normal reflection target.
- Resource and error evidence is captured.

## Accepted Detail

The on-demand containerized scenario runs for five minutes against the release-like single-instance topology. It creates 100 active games, keeps 500 authenticated Socket.IO connections open, distributes legal alternating moves, and records a local report. Valid move confirmation targets p95 below 100 ms and fewer than 1% errors. Results are hardware-specific evidence, not a production guarantee.

## Result

The initial 2026-08-27 run kept 500 connections, completed 1,100 accepted moves with zero valid-command errors, and observed no socket disconnects. Client-observed p95 move latency was 297 ms, above the accepted 100 ms target. A comparable run with a 50-connection PostgreSQL pool reported a 306 ms p95 and was rejected as a mitigation.

Yasmany approved a corrected active-game traffic profile: retain the duration, 100 games, 500 connections, and one move per game every 27 seconds, but distribute each round across that interval instead of issuing an unstated 100-command synchronized burst. The target remains unmet until a comparable run verifies this profile.

The valid corrected run retained 500 connections, completed 1,100 accepted moves with zero valid-command errors and zero socket disconnects, and observed 15 ms p50 / 21 ms p95 client-observed move latency. It satisfies the accepted local target. The earlier report that appeared to use the corrected profile is excluded because the runner had not rebuilt the separately invoked load-client image; the runner now explicitly rebuilds that image before every scenario.
