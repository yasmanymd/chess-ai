# EXP-0002: Initial Real-Time Capacity

| Field            | Value                  |
| ---------------- | ---------------------- |
| Status           | Planned                |
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

## Pending Detail

Load profile, tooling, environment, and thresholds will be refined after stack selection.
