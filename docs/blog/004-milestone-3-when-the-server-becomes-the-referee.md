# Milestone 3: When the Server Becomes the Referee

For a while, Chess AI could bring two people to the same table. That is multiplayer, technically. But it is not yet chess.

The decisive question of Milestone 3 was simple to say and demanding to implement: **when a player clicks a square, who decides whether a chess move happened?**

The answer could not be the browser. A browser can be stale, modified, offline for a moment, or simply wrong. If it decides that a knight moved, then each player has their own version of the game. The server had to become the referee.

## Put the chess library behind a door

We chose `chess.js` for standard chess rules, but deliberately did not let its types or API spread across the project. Instead, the server owns a `ChessRulesPort`: project-language contracts for FEN positions, move intents, legal destinations, SAN notation, termination facts, and PGN output. Only one adapter imports the library.

That separation may sound formal for a first version. It paid off immediately. Reference fixtures covered ordinary moves, illegal moves, checks, checkmate, stalemate, castling, en passant, promotion, FEN reconstruction, SAN, repetition, and move-count rules. An architecture test prevents a convenient future import from bypassing the boundary.

The AI made a useful mistake here, too. An initial assumption about the library's castling API was wrong: its API exposes kingside and queenside predicates rather than one generic castle predicate. The adapter was corrected before it became a public contract. A small isolated boundary turned an implementation error into a contained lesson instead of a project-wide dependency.

## A move is a transaction, not an animation

When a player submits `e2` to `e4`, the server does much more than move a picture:

1. It authenticates the temporary session and confirms that this identity belongs to the game.
2. It locks the active game record and checks the expected version, whose turn it is, and whether the command was already used.
3. It asks the rules adapter whether the move is legal.
4. In one PostgreSQL transaction, it stores the accepted SAN move, both FEN boundaries, the next side to move, status, and a new version number.
5. Only after confirmation does it emit `game.updated`, a hint for clients to fetch confirmed state.

Illegal, stale, duplicate, unauthorized, and out-of-turn commands are rejected with stable public error codes and do not change the game. This is why the product can say that the board changes only after the server confirms it.

The browser deliberately does not perform an optimistic piece animation. It renders the confirmed FEN, offers click/tap selection and legal-destination hints, and waits for the server. That makes the authority model visible instead of merely aspirational.

## A game needs time to matter

Clocks introduce another trap: a timer displayed in a browser is not a reliable clock. The server stores both remaining times and a turn-start timestamp, calculates elapsed time inside the authoritative transaction, applies Blitz increments only after accepted moves, and ends a game when the active player flags.

The browser may estimate the display between snapshots, but it cannot save a player whose time already expired. This distinction became visible in testing: reaching `0:00` now completes the game automatically, without waiting for someone to attempt another move.

Milestone 3 also added server-owned completion paths: checkmate, stalemate, insufficient material, resignation, draw offers and acceptance, eligible draw claims, and timeout. Each lifecycle action is recorded as an event, alongside the final result.

## The human review changed the game screen

The rules were only half the milestone. The other half was repeatedly opening the product on real browsers and phones.

That review reshaped the board experience: deliberate promotion selection, localized feedback, orientation for the black player, coordinate labels, last-move highlighting, a scrolling move list, clocks next to each player, and a roster that makes “you,” the colour, and whose turn it is readable at a glance. Completed games gained a named winner and an explicit path back to the lobby.

Those details are not decorative. In a two-player game, uncertainty about who is playing or whether a move was accepted is a product defect.

## What remains hard

M3 did not claim to solve every distributed-systems problem. Durable command-response replay, restart reconstruction, transactional outbox delivery, and deeper concurrency hardening were intentionally deferred to Milestone 4. The milestone protected the move transition with a version guard and safe duplicate rejection; it did not pretend that this was the final reliability story.

That is the value of the milestone approach. By the end of M3, two people could complete a standard game through the interface, with the server enforcing the rules and clocks. The next question was no longer whether Chess AI could play chess. It was whether it could keep its promises when the network, process, or delivery path failed.

## Sources from the build log

- [Milestone 3 plan](../plan/milestone-3-authoritative-chess-play-plan.md)
- [Session 020: planning](../ai/sessions/020-milestone-3-planning.md)
- [Session 021: chess rules boundary](../ai/sessions/021-milestone-3-rules-boundary.md)
- [Session 022: authoritative move transaction](../ai/sessions/022-milestone-3-authoritative-move-transaction.md)
- [Session 025: clocks, completion, and closure](../ai/sessions/025-milestone-3-closure-implementation.md)
