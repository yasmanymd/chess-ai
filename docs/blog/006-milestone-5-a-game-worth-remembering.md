# Milestone 5: A Game Worth Remembering

When a game ends, a live board has a choice: disappear, or become a record someone can learn from.

Milestone 5 gave Chess AI that second life. Completed games became public archive entries that could be replayed move by move, exported as PGN, and used as the boundary for a private PGN import experience.

## Publishing a completed game without coupling everything

The obvious shortcut would have been to let an archive screen query the active Game tables directly. We did not take it. The Game module owns play; the Archive owns a read projection designed for discovery and replay.

When a game reaches a terminal state, the existing transactional outbox writes a durable `game.completed` fact alongside `game.updated`. An idempotent Archive projector consumes that fact and creates an `archived_games` record plus its archived moves. The projection contains public player names, result, termination reason, completion time, initial and final FEN, and confirmed move data.

The word _idempotent_ matters here. A delivery can repeat without creating duplicate archive records. Startup also performs a repeatable backfill for games that finished before the projection existed. We were not just adding a page; we were giving completed games a durable publication path.

## Replay should be deterministic, not theatrical

The public archive is deliberately readable without a session cookie. Visitors can discover completed games, open one, and move through the recorded line with first, previous, play/pause, next, and final controls.

The replay does not ask the live game service to reconstruct a past moment. It starts from the archived initial FEN and uses the selected recorded `fen_after` states. That makes the board, highlighted move, orientation, and coordinates a deterministic reading of the archived record.

Testing this on desktop and phone changed details that sound small but are crucial to a study experience: the board had to remain readable, the selected move had to be obvious, and the controls had to work on a touch screen. A replay is a conversation with an earlier game; losing your place breaks that conversation.

## PGN is a promise to other chess tools

Chess has a useful advantage: it already has a language for games. PGN lets a person take a recorded game to another application, share it, or keep it outside this product.

The exporter takes the public Archive replay contract rather than reaching into Game persistence. It escapes tag values, emits the confirmed SAN main line, and adds the official result token. Readers can copy the PGN or download a `.pgn` file through a same-origin route.

That boundary carries the same message as the rest of the project: reuse data through an explicit contract, not through convenient private access.

## Import is private by design

We also wanted someone to paste a PGN or choose a `.pgn` file and study it in Chess AI. But importing a stranger's game should not silently publish it.

The import contract accepts one bounded standard-chess PGN, validates its main line and result consistency, accepts comments and variations while exposing only the verified main line, and returns an in-memory replay representation. The `/import` page keeps it only in current-tab state. Refresh, close the tab, or import another game, and it is gone. Nothing is written to Game, Archive, or the database.

That small privacy choice made the feature clearer: public archive is for games played through the product; private import is for personal exploration.

## The MVP boundary remains visible

Every completed game is public in this temporary-identity MVP. Account-level visibility, moderation, multi-game file selection, variation navigation, annotations, editing, and variants are all future work. The limitation is explicit rather than hidden behind a vague “coming soon.”

By the end of M5, Chess AI could do more than host a game. It could remember it, explain it through replay, and speak a standard language beyond its own interface. That created the bridge to the educational features that followed.

## Sources from the build log

- [Milestone 5 plan](../plan/milestone-5-archive-and-chess-interchange-plan.md)
- [Session 032: planning](../ai/sessions/032-milestone-5-planning.md)
- [Session 033: archive projection](../ai/sessions/033-milestone-5-1-archive-projection.md)
- [Session 034: public archive and replay](../ai/sessions/034-milestone-5-2-public-archive-and-replay.md)
- [Session 035: PGN export](../ai/sessions/035-milestone-5-3-pgn-export.md)
- [Session 036: private PGN import](../ai/sessions/036-milestone-5-4-private-pgn-import.md)
- [Session 037: exit validation](../ai/sessions/037-milestone-5-exit-validation.md)
