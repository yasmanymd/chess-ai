# Domain Model

## Document Control

| Field | Value |
|---|---|
| Status | Accepted |
| Version | 1.0 |
| Decision owner | Yasmany |
| Source | Session 007 and ADR-0002 |

## Purpose

Define the business language and consistency boundaries of the MVP independently of frameworks, database schemas, and transport protocols.

## Ubiquitous Language

| Term | Meaning |
|---|---|
| Temporary Identity | Accountless, globally unique, time-bounded player identity protected by a private session credential |
| Player Participation | The admission record ensuring one identity has at most one waiting or active game |
| Waiting Game | A public lobby offer that has not yet accepted an opponent |
| Chess Game | The authoritative aggregate for a started game |
| Player Seat | A participant's immutable identity snapshot and assigned color within a game |
| Move Record | An accepted move and its ordered notation, resulting state, and relevant clock data |
| Game Clock | The authoritative time state for both players |
| Draw Offer | A pending, accepted, rejected, or superseded draw proposal |
| Archived Game | Public read projection of a terminal authoritative game |
| Replay | Read-only reconstruction of a game over its ordered move history |
| Imported Game | Validated, private, non-persisted PGN representation |

## Aggregates

### TemporaryIdentity

Owns the claimed display name, normalized name, protected private-session association, lifecycle state, expiration, release, and recovery rules.

Global normalized-name uniqueness is enforced atomically through persistence rather than by creating one in-memory aggregate containing every name.

### PlayerParticipation

Owns the invariant that one temporary identity has at most one waiting or active game. It is keyed by `IdentityId` and records the applicable `GameId` and participation state.

### WaitingGame

Owns a public game offer's creator, title, color preference, time control, creation time, and waiting lifecycle. It controls creator cancellation and opponent acceptance.

### ChessGame

Owns authoritative participants, color assignment, position, side to move, move history, clocks, draw state, connection state, lifecycle, terminal result, and termination reason.

State-changing game commands use aggregate versioning, locking, or an equivalent proven serialization mechanism to prevent incompatible concurrent transitions.

## Internal Entities

ChessGame contains:

- `PlayerSeat`: identity snapshot, public display name, and assigned color.
- `MoveRecord`: sequence, structured move, SAN, resulting position reference, and relevant clock state.
- `GameClock`: remaining time, active side, increment, and timing anchor.
- `DrawOffer`: offering player and offer lifecycle.

## Value Objects

- `IdentityId`, `GameId`, and `CommandId`.
- `DisplayName` and `NormalizedDisplayName`.
- `GameTitle`.
- `Color`.
- `TimeControl`.
- `Square`, `Move`, and `PromotionPiece`.
- `Position`.
- `SAN`, `FEN`, and `PGN`.
- `GameResult` and `TerminationReason`.
- `Instant` and `Duration`.

Value objects are immutable and compare by value rather than object identity.

## Read Models and Ephemeral Models

The following are not authoritative aggregates:

- `AvailableGameList`: lobby projection.
- `ArchivedGame`: completed-game public projection.
- `GameSearchIndex`: filter-oriented projection.
- `Replay`: read-only reconstruction.
- `ImportedGame`: temporary validated PGN representation.

They cannot change an active game's position, clock, or result.

## Aggregate Invariants

### TemporaryIdentity Invariants

- The normalized name is valid and globally unique while reserved.
- Recovering the identity requires its valid private credential.
- Recoverable credential material is protected and must not be exposed through logs or ordinary reads.
- A disconnected lobby-only identity remains reserved for 15 minutes.
- Active-game participation extends reservation through the game lifecycle.
- Releasing a name never changes historical attribution.

### PlayerParticipation Invariants

- One identity references at most one game participation.
- Valid states are `Waiting`, `Active`, and `Released`.
- Normal progression is `Waiting -> Active -> Released`.
- Cancellation transitions `Waiting -> Released`.
- An active participation cannot return to waiting before release.

### WaitingGame Invariants

- A waiting game has exactly one creator.
- The creator cannot join the same waiting game as opponent with the same identity.
- Only the creator may cancel it.
- Only the first atomically confirmed eligible opponent may join it.
- Valid states are `Waiting`, `Matched`, `Cancelled`, and `Expired`.
- A game is publicly available only while `Waiting`.
- Expiration of a disconnected creator's lobby identity expires the waiting game.

### ChessGame Invariants

- A game has exactly two distinct temporary identities in opposite colors.
- Only the side to move may request a move.
- A move is confirmed only when legal against the current authoritative version.
- Repeating a processed `CommandId` returns the prior result without duplicating effects.
- Every confirmed move increments authoritative version and becomes durable before success is returned.
- Official time uses the clock port exclusively.
- At most one draw offer is pending.
- Terminal games are immutable.
- Result and termination reason must be coherent.
- No post-terminal command may change position, clock, move history, or result.
- Terminal state and durable completion event are persisted atomically.
- Confirmed ordered history reconstructs the same deterministic game outcome.

## Lifecycle State Machines

### Temporary Identity Lifecycle

```text
Lobby
  -> LobbyGracePeriod -> Lobby
  -> LobbyGracePeriod -> Expired
  -> InGame -> Lobby
  -> Released
```

A connected identity returning from a completed game remains reserved in the lobby. A later lobby disconnection starts the 15-minute grace period. Voluntary release ends the session.

Connection presence is modeled separately from business lifecycle where necessary.

### Player Participation Lifecycle

```text
Waiting -> Active -> Released
Waiting -> Released
```

Cancellation or waiting-game expiration releases waiting participation. A released identity may later create a new participation.

### Waiting Game Lifecycle

```text
Waiting -> Matched
Waiting -> Cancelled
Waiting -> Expired
```

Matched, Cancelled, and Expired are terminal states for a specific waiting-game aggregate.

### Chess Game Lifecycle

```text
Active -> Completed
```

Disconnection changes player presence but does not pause the game or official clock.

Completed games carry a coherent result and precise termination reason. Claim-based reasons include `ThreefoldRepetitionClaim` and `FiftyMoveRuleClaim`. Automatic reasons include `FivefoldRepetition`, `SeventyFiveMoveRule`, `Stalemate`, and `DeadPosition`. Other reasons include `DrawAgreement`, `Checkmate`, `Resignation`, `Timeout`, and `Abandonment`.

Threefold repetition and the fifty-move rule require a valid claim by the player with the move. A claim may reference the current state or a declared intended legal move as defined by the adopted FIDE rules. Fivefold repetition and the seventy-five-move rule are automatic; checkmate on the final move takes precedence over the seventy-five-move rule.

Timeout produces a draw only when the opponent cannot checkmate through any possible series of legal moves.

### Draw Offer Lifecycle

```text
None -> Pending
Pending -> Accepted
Pending -> Rejected -> None
Pending -> Superseded -> None
```

Acceptance completes the game. Rejection clears the offer. A move by the receiving player supersedes the pending offer.

## Commands and Events

## Commands

### Temporary Identity Commands

- `ClaimTemporaryIdentity`
- `ResumeTemporaryIdentity`
- `MarkIdentityDisconnected`
- `ReleaseTemporaryIdentity`
- `ExpireTemporaryIdentity`

### Lobby Commands

- `CreateWaitingGame`
- `CancelWaitingGame`
- `JoinWaitingGame`
- `ExpireWaitingGame`

### Game Commands

- `StartGame`
- `MakeMove`
- `ClaimDraw`
- `OfferDraw`
- `AcceptDraw`
- `RejectDraw`
- `Resign`
- `MarkPlayerConnected`
- `MarkPlayerDisconnected`
- `AdjudicateTimeout`
- `AdjudicateAbandonment`

Game recovery is a query because reading authoritative recovery state does not itself change the game.

## Command Rules

- Every external state-changing command carries a `CommandId`, acting identity, required input, and expected version where applicable.
- Reprocessing a completed `CommandId` returns its prior result without duplicating effects.
- A command result contains acceptance or rejection, stable code, resulting version, and the authoritative state required by the caller.
- `MakeMove` carries origin, destination, and promotion choice when required.
- `ClaimDraw` may carry an intended legal move that would create the claimable state.
- Timeout, expiration, and abandonment adjudication are internal system commands.
- Queries never modify domain state.
- Generic mutation commands such as `UpdateGame` are forbidden; commands express explicit business intent.

## Events

### Temporary Identity Events

- `TemporaryIdentityClaimed`
- `TemporaryIdentityResumed`
- `TemporaryIdentityDisconnected`
- `TemporaryIdentityExpired`
- `TemporaryIdentityReleased`

### Lobby Events

- `WaitingGameCreated`
- `WaitingGameCancelled`
- `WaitingGameExpired`
- `WaitingGameMatched`

### Game Events

- `GameStarted`
- `MoveConfirmed`
- `DrawOffered`
- `DrawOfferRejected`
- `DrawOfferSuperseded`
- `PlayerConnectionChanged`
- `GameCompleted`

`GameCompleted` carries stable result and termination-reason codes rather than localized text.

## Event Semantics

Domain events describe facts within a model. Integration events are durable, stable representations intended for another module or adapter. Not every internal domain event is published externally.

Every published event contains:

- `EventId`.
- Event type and schema version.
- Aggregate identifier and version.
- Authoritative occurrence time.
- `CorrelationId`.
- `CausationId`.

Events result from accepted commands. Rejected commands do not emit successful domain facts.

`MoveConfirmed` may reach players only after durable commit. `GameCompleted` is persisted atomically with terminal state and supplies Game Archive.

Consumers are idempotent and preserve per-aggregate ordering where required. Cross-module event contracts are versioned; incompatible changes require migration or a new version.

Browser notifications derive from authoritative command results or committed events and never expose credentials or private internal types.

Immediate-consistency workflows, including matching a waiting game and creating its authoritative game, use the approved coordinated transaction rather than eventual processing.

## Consolidated Domain View

```mermaid
flowchart LR
    Identity["TemporaryIdentity\nAggregate"]
    Participation["PlayerParticipation\nAggregate"]
    Waiting["WaitingGame\nAggregate"]
    Game["ChessGame\nAggregate"]

    Seats["PlayerSeat"]
    Moves["MoveRecord"]
    Clock["GameClock"]
    Draw["DrawOffer"]

    Available["AvailableGameList\nRead model"]
    Archive["ArchivedGame\nRead model"]
    Search["GameSearchIndex\nRead model"]
    Replay["Replay\nRead model"]
    Imported["ImportedGame\nEphemeral model"]

    Identity -->|"owns admission identity"| Participation
    Participation -->|"Waiting"| Waiting
    Waiting -->|"atomic match transaction"| Game
    Participation -->|"Active"| Game

    Game *-- Seats
    Game *-- Moves
    Game *-- Clock
    Game *-- Draw

    Waiting -->|"projection"| Available
    Game -->|"durable GameCompleted"| Archive
    Archive --> Search
    Archive --> Replay
    Imported -->|"private validation and replay"| Replay
```

Read and ephemeral models cannot issue authoritative game transitions.

## Normative Rules Reference

Standard-chess behavior initially follows the [FIDE Laws of Chess effective from 1 January 2023](https://handbook.fide.com/chapter/e012023). Product-specific online interaction decisions must be identified explicitly rather than described as official FIDE behavior.

## Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Project owner | Yasmany | Accepted | 2026-08-18 |
| AI collaborator | Codex | Interviewed, verified, and drafted | 2026-08-18 |

## Revision History

| Version | Date | Change | Decision owner |
|---|---|---|---|
| 0.1 | 2026-08-18 | Domain-model elicitation opened. | Yasmany |
| 1.0 | 2026-08-18 | Language, aggregates, invariants, lifecycles, commands, events, rules correction, and consolidated view accepted. | Yasmany |
