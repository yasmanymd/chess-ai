# EXP-0003: Active-Game Restart Recovery

| Field            | Value                  |
| ---------------- | ---------------------- |
| Status           | Planned                |
| Owner            | AI implementation team |
| Decision owner   | Yasmany                |
| Related decision | ADR-0001               |

## Hypothesis

The selected architecture can restore active sessions, positions, moves, turns, draw state, clocks, and status after process restart within five minutes.

## Success Criteria

- Zero confirmed moves lost.
- Restored state matches the pre-failure authoritative state.
- Clock behavior follows the accepted recovery rules.
- Clients can reconnect and continue when the game remains active.

## Pending Detail

Failure injection and recovery procedure will be refined after persistence and clock design.
