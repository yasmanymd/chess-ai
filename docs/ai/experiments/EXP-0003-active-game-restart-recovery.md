# EXP-0003: Active-Game Restart Recovery

| Field            | Value                  |
| ---------------- | ---------------------- |
| Status           | Passed                 |
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

## Accepted Detail

The release-like experiment restarts the API during an active game, reconnects its participants, and verifies the authoritative position, history, side to move, clocks, and status. The recovery drill uses a disposable local database and records evidence separately from any future production backup service.

## Result

The automated local drill passed on 2026-08-27. It restarted the API, reconnected both participants, and verified the authoritative position, move history, side to move, status, version, time control, and clocks. It also created and restored a custom-format PostgreSQL backup into a second disposable database.
