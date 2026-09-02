# Milestone 4: Playing Through Failure

The first real game exposed a truth every multiplayer system eventually meets: a legal move is not enough. What happens when the request is retried, the notification fails, the server restarts, or two identical requests arrive together?

Milestone 4 was Chess AI's answer. Its purpose was not to make the game look more impressive. It was to make confirmed games survive ordinary failure without losing, duplicating, or corrupting the state that the server owns.

## Retrying should not mean playing twice

Networks retry. Browsers retry. People tap twice. Treating every request as new can turn one intended move into two transitions.

We added a durable command ledger keyed by game and client command ID. When a command has already succeeded, the server returns its recorded confirmed result rather than running the transition again. The rule applies to moves and game actions alike.

This is a small contract with a large effect: clients can retry safely. More importantly, concurrent duplicate requests are protected at the database boundary. The game row is locked before the ledger is consulted; the first transaction commits one move, and a competing retry sees that stored result.

## Store the intent to notify with the move

Before M4, a confirmed move and a real-time notification were adjacent actions. That looks fine until the process fails between them. The game can be correct while players never learn it changed.

The solution was a transactional outbox. In the same PostgreSQL transaction that stores a confirmed move, resignation, draw action, or clock expiry, the server also stores a `game.updated` delivery intent. The state change and the promise to notify either both persist or neither does.

A separate dispatcher claims pending records with a temporary lease, publishes them, and marks them delivered only after success. If publication fails, the lease is released and bounded exponential backoff schedules another attempt. Restarting the server resumes the dispatch loop.

This does not turn Socket.IO into an authority. It does the opposite: it makes notifications explicitly retryable hints, while HTTP remains the source of confirmed state.

## Recovery is a product behaviour

The browser response to a reconnect is not “hope the missed event arrives.” Game and lobby screens refetch their authoritative route data on Socket.IO reconnect and when a hidden tab becomes visible again; periodic revalidation remains a fallback.

That choice matters because it avoids merging fragile notification payloads into local state. A browser asks the source of truth what the game is now. The persisted turn timestamp likewise means that an active clock continues through a server restart; time is not paused because a process was restarted.

## Reliability also includes chess rules

M4 closed an important rules gap. Confirmed move history is replayed through the project-owned rules port so repetition depends on the actual whole game, not only the latest position. Fivefold repetition becomes an automatic draw, and the automatic seventy-five-move condition is enforced too. A concurrent-duplicate test and a 16-ply repetition fixture prove that these rules still hold under the authoritative transaction path.

## Honest boundaries

The tests passed across TypeScript, lint, architecture checks, isolated PostgreSQL integration, injected publication failure, browser accessibility, and formatting. But the milestone did not declare victory over every production concern.

Socket.IO delivery remains at-least-once and local-process scoped. The PostgreSQL outbox is durable, but it is not an external message bus or a multi-region deployment solution. Account-based recovery and observability dashboards were intentionally left for later.

That honesty is part of the architecture. By the end of M4, Chess AI could keep a game coherent through the failures a local multiplayer product already encounters. The project had learned not just how to accept a move, but how to keep believing the same move after things go wrong.

## Sources from the build log

- [Milestone 4 plan](../plan/milestone-4-durability-recovery-concurrency-plan.md)
- [Session 026: planning](../ai/sessions/026-milestone-4-planning.md)
- [Session 027: durable command ledger](../ai/sessions/027-milestone-4-1-durable-command-ledger.md)
- [Session 028: retry-safe outbox](../ai/sessions/028-milestone-4-2-outbox-dispatch.md)
- [Session 029: restart and reconnection recovery](../ai/sessions/029-milestone-4-3-recovery.md)
- [Session 031: exit validation](../ai/sessions/031-milestone-4-exit-validation.md)
