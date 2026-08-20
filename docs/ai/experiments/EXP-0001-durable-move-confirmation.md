# EXP-0001: Durable Move Confirmation

| Field            | Value                  |
| ---------------- | ---------------------- |
| Status           | Planned                |
| Owner            | AI implementation team |
| Decision owner   | Yasmany                |
| Related decision | ADR-0001               |

## Hypothesis

The selected modular-monolith stack can validate, serialize, persist, and acknowledge a move without losing an acknowledged transition under injected process failure.

## Success Criteria

- No acknowledged move is lost.
- Retried commands do not duplicate moves.
- Recovered clients converge on the authoritative state.

## Pending Detail

Method, environment, and evidence format will be refined after stack and persistence selection.
