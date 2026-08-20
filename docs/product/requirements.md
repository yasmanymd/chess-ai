# Product Requirements

## Document Control

| Field | Value |
|---|---|
| Status | Accepted |
| Version | 1.1 |
| Decision owner | Yasmany |

These functional and non-functional requirements were elicited and approved in Session 002.

Material changes require recorded context, impact, rationale, and human approval.

## 1. Temporary Player Identity

### PR-ID-001 — Player-selected display name

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D01 |

Before entering the public game lobby, a person must choose a freely entered display name.

#### Acceptance criteria

- The entry experience provides a display-name field.
- A valid display name allows the person to continue to the game lobby.
- The platform does not require a registered account for this flow.
- Leading and trailing whitespace is removed before validation.
- The normalized display name contains between 2 and 30 characters.
- International letters, numbers, spaces, hyphens, and underscores are accepted.
- An empty or whitespace-only display name is rejected.
- Automated offensive-word filtering is not required for the MVP.

### PR-ID-002 — Display-name uniqueness

| Field | Value |
|---|---|
| Type | Business rule |
| Priority | Must |
| Status | Accepted |
| Source | S002-D05 and S002-D06 |

A normalized temporary display name must be globally unique across the platform while its identity reservation remains active.

Uniqueness comparison is case-insensitive. For example, `Yasmany` and `yasmany` represent the same temporary name for uniqueness purposes.

#### Acceptance criteria

- A person cannot claim a name whose reservation is active anywhere in the platform.
- Case variations cannot bypass the uniqueness rule.
- The person receives a clear validation response when a name is unavailable.
- The exact reservation and release lifecycle will be defined with reconnection requirements.

#### Rationale

The temporary display name acts as the platform-wide username during the accountless MVP, even though it is not yet a registered user account.

### PR-ID-003 — No identity-based self-play prevention

| Field | Value |
|---|---|
| Type | Business rule |
| Priority | Must |
| Status | Accepted |
| Source | S002-D04 |

The MVP will not attempt to determine whether two temporary players are controlled by the same person. Two browsers may join the same game using different valid display names.

#### Rationale

Temporary identities do not provide a reliable basis for detecting a real person, and this behavior supports development and testing.

### PR-ID-004 — Display-name validation

| Field | Value |
|---|---|
| Type | Business rule |
| Priority | Must |
| Status | Accepted |
| Source | S002-D06 |

A normalized display name must contain between 2 and 30 characters. It may contain international letters, numbers, spaces, hyphens, and underscores. Leading and trailing whitespace must be removed before validation. Empty and whitespace-only names must be rejected.

Automated offensive-word filtering is not required for the MVP and remains a known moderation limitation.

### PR-ID-005 — Temporary identity lifecycle

| Field | Value |
|---|---|
| Type | Functional and security |
| Priority | Must |
| Status | Accepted |
| Source | S002-D07 |

Claiming an available display name must create a temporary private session that allows the same browser session to recover the identity after a reload or eligible reconnection.

#### Business rules

- A temporary identity is recoverable only with its private session credential; knowing the display name is insufficient.
- While the player remains connected, the name reservation remains active.
- If a player disconnects while only in the lobby, the name remains reserved for 15 minutes.
- If a player belongs to an active game, the name remains reserved for the duration of that game, including periods of disconnection.
- After a game is completed or formally abandoned, the display name remains in historical records but may be released for a new temporary session.
- Another browser tab presenting the same valid private session represents the same temporary identity, not a new player.

#### Acceptance criteria

- Reloading with a valid session recovers the same temporary identity.
- A different session cannot take over an actively reserved name.
- A disconnected lobby identity can reconnect within 15 minutes.
- A lobby-only name becomes available after its reservation expires.
- Historical game attribution is preserved after the temporary name is released.

## 2. Game Discovery and Participation

### PR-GAME-001 — Public available-game list

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D02 |

A temporary player must be able to view a public list of games that are available to join.

#### Acceptance criteria

- The lobby displays currently joinable public games.
- A player can select an available game and initiate the join flow.
- A game that is no longer joinable must not remain presented as available after the lobby receives current state.

### PR-GAME-002 — Spectators excluded from MVP

| Field | Value |
|---|---|
| Type | Scope constraint |
| Priority | Must |
| Status | Accepted |
| Source | S002-D03 |

The MVP will not provide a spectator role or spectator entry flow.

### PR-GAME-003 — Create a public game

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D08 |

A player without another open or active game must be able to create a public game with an optional title, a color preference, and a predefined time control.

#### Business rules

- A player may have at most one waiting or active game.
- The optional title receives a generated value based on the creator's display name when omitted.
- Color choices are White, Black, or Random.
- Random is the default color choice.
- A predefined no-clock option is available alongside timed controls.

### PR-GAME-004 — Available-game information

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D09 |

Each public waiting game must display its title, creator display name, color preference or random assignment, time control, and elapsed waiting time.

### PR-GAME-005 — Atomic game joining

| Field | Value |
|---|---|
| Type | Functional and concurrency |
| Priority | Must |
| Status | Accepted |
| Source | S002-D10 |

Joining a waiting game must be atomic. If multiple eligible players attempt to join the same game concurrently, only the first successfully confirmed request may become the opponent.

#### Acceptance criteria

- Exactly one opponent is assigned.
- An unsuccessful concurrent join attempt receives a clear message.
- The unsuccessful player returns to an up-to-date available-game list.
- A player with another waiting or active game cannot join.

### PR-GAME-006 — Cancel a waiting game

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D11 |

The creator may cancel a game while it is waiting for an opponent. A game that has already accepted an opponent can no longer use the waiting-game cancellation flow.

### PR-GAME-007 — Automatic game start

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D12 |

The game must start automatically after the second player is successfully confirmed and colors are assigned.

Both players must receive the same authoritative initial position, player-color assignment, time-control configuration, and game status.

## 3. Chess Gameplay

### PR-PLAY-001 — Server-authoritative legal play

| Field | Value |
|---|---|
| Type | Functional and integrity |
| Priority | Must |
| Status | Accepted |
| Source | S002-D13 |
| Implementation risk | High |

The server must be authoritative for turn order, legal moves, game state, and game outcome.

The rules implementation must support standard chess behavior, including:

- Legal piece movement and captures.
- Check and checkmate.
- Castling.
- En passant.
- Promotion.
- Stalemate.
- Insufficient material.
- Claim-based threefold repetition.
- The claim-based fifty-move rule.
- Automatic fivefold repetition.
- The automatic seventy-five-move rule.
- Dead positions in which checkmate cannot occur through any legal sequence.

An illegal or out-of-turn request must not change authoritative state and must return a reason suitable for user feedback.

### PR-PLAY-002 — Board interaction and legal destinations

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D14 |

Selecting a piece controlled by the current player must display its currently legal destination squares. Selecting a destination submits a move request for authoritative validation.

### PR-PLAY-003 — Pawn promotion

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D15 |

When a pawn reaches its promotion rank, the player must choose Queen, Rook, Bishop, or Knight. The move is not complete and play cannot continue until a valid promotion piece is confirmed.

### PR-PLAY-004 — Player game actions

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D16 |

During an active game, a player may resign or offer a draw. The opponent may accept or reject an outstanding draw offer. Move takeback is not supported in the MVP.

A player with the move may claim a draw under the applicable threefold-repetition or fifty-move conditions. The claim may apply to the current position or to a declared intended legal move when required by the official rule. The server authoritatively validates the claim.

### PR-PLAY-005 — Authoritative move confirmation

| Field | Value |
|---|---|
| Type | Functional and real-time |
| Priority | Must |
| Status | Accepted |
| Source | S002-D17 |
| Implementation risk | High |

After every accepted move, both players must receive the authoritative position, last move, side to move, game status, and applicable clock values. A rejected request must leave state unchanged and provide a rejection reason.

### PR-PLAY-006 — Move notation and position representation

| Field | Value |
|---|---|
| Type | Data and interoperability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D18 |

Each accepted move must be recorded in Standard Algebraic Notation (SAN) and with sufficient structured information to reconstruct the game. Forsyth–Edwards Notation (FEN) must be retained or derivable where required for recovery and interoperability.

## 4. Chess Clocks

### PR-TIME-001 — Initial time controls

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D19 |

The MVP must offer these predefined controls:

- No clock.
- 5 minutes per player with no increment.
- 10 minutes per player with no increment.
- 15 minutes per player with a 10-second increment after each completed move.

### PR-TIME-002 — Server-authoritative clock

| Field | Value |
|---|---|
| Type | Functional and integrity |
| Priority | Must |
| Status | Accepted |
| Source | S002-D20 |
| Implementation risk | High |

The server must maintain official remaining time. Clients may render a smooth local estimate but must reconcile it with authoritative server updates.

### PR-TIME-003 — Timeout outcome

| Field | Value |
|---|---|
| Type | Business rule |
| Priority | Must |
| Status | Accepted |
| Source | S002-D21 |
| Implementation risk | High |

A player whose official clock expires loses on time unless the opponent cannot checkmate that player through any possible series of legal moves, in which case the result is a draw.

## 5. Disconnection and Recovery

### PR-REC-001 — Disconnection visibility

| Field | Value |
|---|---|
| Type | Functional and real-time |
| Priority | Must |
| Status | Accepted |
| Source | S002-D22 |

When a player's connection is lost, the opponent must receive a visible disconnected status. A transient connection loss is not immediately treated as resignation.

### PR-REC-002 — Authoritative reconnection recovery

| Field | Value |
|---|---|
| Type | Functional and recovery |
| Priority | Must |
| Status | Accepted |
| Source | S002-D23 |
| Implementation risk | High |

Reconnecting with the valid private session credential must restore the player's active game, assigned color, authoritative position, move history, side to move, outstanding draw state, game status, and official clock values.

The recovered authoritative state replaces uncertain or stale local client state, including uncertainty about whether a move was accepted immediately before disconnection.

### PR-REC-003 — Timed-game disconnection

| Field | Value |
|---|---|
| Type | Business rule |
| Priority | Must |
| Status | Accepted |
| Source | S002-D24 |
| Implementation risk | High |

In a timed game, the authoritative clock continues during a player's disconnection. If the active clock expires, the standard timeout outcome applies.

If both players disconnect, the clock belonging to the side to move continues.

### PR-REC-004 — No-clock disconnection grace period

| Field | Value |
|---|---|
| Type | Business rule |
| Priority | Must |
| Status | Accepted |
| Source | S002-D25 |
| Implementation risk | High |

In a no-clock game, a disconnected player has 15 minutes to reconnect. Failure to return produces a loss by abandonment.

If both players remain disconnected for 15 minutes, the game ends as abandoned without a winner.

### PR-REC-005 — Explicit active-game exit

| Field | Value |
|---|---|
| Type | Business rule |
| Priority | Must |
| Status | Accepted |
| Source | S002-D26 |

Explicitly leaving or abandoning an active game is treated as resignation. Closing or losing the network connection alone is governed by disconnection rules instead.

### PR-REC-006 — Active-game durability

| Field | Value |
|---|---|
| Type | Reliability and recovery |
| Priority | Must |
| Status | Accepted |
| Source | S002-D27 |
| Implementation risk | High |

Authoritative active-game state must survive a game-server process restart for the duration required by clock, reconnection, and abandonment rules.

### PR-REC-007 — Multiple tabs and action serialization

| Field | Value |
|---|---|
| Type | Concurrency and integrity |
| Priority | Must |
| Status | Accepted |
| Source | S002-D28 |
| Implementation risk | High |

A temporary session may be presented by multiple browser tabs. The server must serialize competing actions against authoritative state and reject actions that are no longer valid.

## 6. Completed Games and Replay

### PR-HIST-001 — Completed-game persistence

| Field | Value |
|---|---|
| Type | Data and functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D29 |
| Implementation risk | High |

Every started game that reaches a terminal outcome must be persisted, including checkmate, draw, resignation, abandonment, and timeout.

The persisted record must include:

- Game identifier and title.
- Player display names and assigned colors.
- Time control.
- Creation, start, and completion timestamps.
- Result and termination reason.
- Initial position.
- Ordered moves in SAN and sufficient structured form for reconstruction.
- Final position.
- Generated PGN.

### PR-HIST-002 — Public completed-game history

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D30 |

Any visitor must be able to browse completed public games without claiming a temporary player identity.

### PR-HIST-003 — History search and filters

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D31 |

Completed games must be searchable or filterable by player display name, result, termination reason, time control, and date range.

Display-name search does not establish real-person identity because temporary names may be reused after release. The interface and documentation must not imply verified ownership across historical games.

### PR-HIST-004 — Completed-game detail

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D32 |

A completed-game detail view must show players and colors, result, termination reason, completion date, time control, and ordered move notation.

### PR-HIST-005 — Move-by-move replay

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D33 |

A visitor must be able to replay a completed game on a board synchronized with its notation.

Replay controls must support:

- Jump to the initial or final position.
- Advance or return by one move.
- Select a specific move.
- Start automatic playback.
- Pause automatic playback.

### PR-HIST-006 — MVP retention

| Field | Value |
|---|---|
| Type | Data lifecycle |
| Priority | Must |
| Status | Accepted |
| Source | S002-D34 |

Completed games are retained indefinitely during the MVP. Administrative deletion and a mature retention policy are deferred.

## 7. PGN Interoperability

### PR-PGN-001 — Completed-game export

| Field | Value |
|---|---|
| Type | Functional and interoperability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D35 |

Any completed game must be exportable as a downloaded `.pgn` file or copied PGN text.

The export must include applicable standard headers for event, site, date, round, White, Black, result, time control, termination reason, and non-standard initial position.

### PR-PGN-002 — Single-game import

| Field | Value |
|---|---|
| Type | Functional and interoperability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D36 |

A visitor must be able to import one game by selecting a `.pgn` file or pasting PGN text. Multi-game import is outside the MVP.

### PR-PGN-003 — Import validation and feedback

| Field | Value |
|---|---|
| Type | Functional and integrity |
| Priority | Must |
| Status | Accepted |
| Source | S002-D37 |

The platform must validate imported PGN structure, main-line moves, result, and game consistency before replay. Invalid input must provide a useful error location or reason when available.

### PR-PGN-004 — Private imported-game replay

| Field | Value |
|---|---|
| Type | Functional and privacy |
| Priority | Must |
| Status | Accepted |
| Source | S002-D38 |

A successfully imported game opens in the replay experience but is not automatically persisted or published in public history.

### PR-PGN-005 — Standard chess and initial positions

| Field | Value |
|---|---|
| Type | Interoperability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D39 |

The importer must support standard chess games from the normal initial position and games declaring a valid non-standard initial position through `SetUp` and `FEN` tags. Chess960 and other variants are outside the MVP.

### PR-PGN-006 — Main-line replay

| Field | Value |
|---|---|
| Type | Interoperability and scope |
| Priority | Must |
| Status | Accepted |
| Source | S002-D40 |

The importer must tolerate standard PGN comments, variations, and annotation symbols, but MVP replay is required to display only the main line. Annotation display and editing are deferred.

## 8. Internationalization

### PR-I18N-001 — Supported interface languages

| Field | Value |
|---|---|
| Type | Functional and localization |
| Priority | Must |
| Status | Accepted |
| Source | S002-D41 |

The complete MVP interface must be available in English, Spanish, and French.

### PR-I18N-002 — Language selection and persistence

| Field | Value |
|---|---|
| Type | Functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D42 |

On first use, the platform selects the browser's preferred supported language and falls back to English when no supported preference exists. A visible manual selector must allow language changes, and the selection must persist for future visits.

### PR-I18N-003 — Translation coverage

| Field | Value |
|---|---|
| Type | Localization quality |
| Priority | Must |
| Status | Accepted |
| Source | S002-D43 |

Navigation, forms, validation, errors, connection states, results, termination reasons, board controls, and help text must be localized. User-facing text must not be embedded directly in UI components in a way that bypasses localization resources.

SAN, FEN, and PGN remain standards-based. Surrounding explanatory interface text must be localized.

### PR-I18N-004 — Locale-aware formatting

| Field | Value |
|---|---|
| Type | Localization quality |
| Priority | Must |
| Status | Accepted |
| Source | S002-D44 |

Dates, times, numbers, and plural forms must use the selected locale's conventions.

## 9. Accessibility and Responsive Use

### PR-A11Y-001 — WCAG target

| Field | Value |
|---|---|
| Type | Non-functional |
| Priority | Must |
| Status | Accepted |
| Source | S002-D45 |

MVP functionality must target conformance with WCAG 2.2 Level AA.

### PR-A11Y-002 — Accessible chess interaction

| Field | Value |
|---|---|
| Type | Functional and accessibility |
| Priority | Must |
| Status | Accepted |
| Source | S002-D46 |

The chess board must be operable by keyboard. Squares and pieces must be identifiable by assistive technologies. Turn, check, result, clock, and rejected-move changes must be communicated accessibly.

State must not depend only on color. Focus must be visible and applicable contrast must meet the adopted accessibility target.

### PR-A11Y-003 — Motion preferences

| Field | Value |
|---|---|
| Type | Accessibility |
| Priority | Must |
| Status | Accepted |
| Source | S002-D47 |

The interface must respect reduced-motion preferences. No animation may be essential to understanding or operating the game.

### PR-A11Y-004 — Responsive web interface

| Field | Value |
|---|---|
| Type | Usability and compatibility |
| Priority | Must |
| Status | Accepted |
| Source | S002-D48 |

MVP functionality must work in supported desktop, tablet, and mobile web browsers. Native mobile applications remain outside scope.

## 10. Security and Privacy

### PR-SEC-001 — Secure production transport

| Field | Value |
|---|---|
| Type | Security |
| Priority | Must |
| Status | Accepted |
| Source | S002-D49 |

Production HTTP and real-time communication must use secure encrypted transport.

### PR-SEC-002 — Untrusted client boundary

| Field | Value |
|---|---|
| Type | Security and integrity |
| Priority | Must |
| Status | Accepted |
| Source | S002-D50 |
| Implementation risk | High |

The server must not trust client-calculated identity, legal moves, turn order, clock state, game state, or results.

### PR-SEC-003 — Temporary-session security

| Field | Value |
|---|---|
| Type | Security |
| Priority | Must |
| Status | Accepted |
| Source | S002-D51 |
| Implementation risk | High |

Temporary-session credentials must be unpredictable, expire according to the identity lifecycle, and use secure browser storage and transport appropriate to the selected architecture.

### PR-SEC-004 — Input and abuse controls

| Field | Value |
|---|---|
| Type | Security and reliability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D52 |

Names, PGN, commands, and request parameters must be validated. Appropriate payload-size and request-frequency limits must protect public interfaces.

### PR-SEC-005 — Automated security checks

| Field | Value |
|---|---|
| Type | Security process |
| Priority | Must |
| Status | Accepted |
| Source | S002-D53 |

Continuous integration must include applicable dependency-vulnerability, secret, and static security checks. OWASP ASVS will guide security requirements; the target verification level will be selected during security design.

### PR-PRIV-001 — Data minimization and public-data notice

| Field | Value |
|---|---|
| Type | Privacy |
| Priority | Must |
| Status | Accepted |
| Source | S002-D54 |

The MVP must collect only information necessary for its functions. Before playing, the interface must explain that display names and completed games are public.

The MVP will not include advertising, commercial tracking, or invasive analytics.

### PR-PRIV-002 — Safe telemetry

| Field | Value |
|---|---|
| Type | Privacy and operations |
| Priority | Must |
| Status | Accepted |
| Source | S002-D55 |

Logs, metrics, traces, and error reports must not contain session credentials or unnecessary sensitive content.

## 11. Performance and Capacity

### PR-PERF-001 — User-perceived page performance

| Field | Value |
|---|---|
| Type | Performance |
| Priority | Must |
| Status | Accepted as initial target |
| Source | S002-D56 |

Main user journeys should achieve a 75th-percentile Largest Contentful Paint below 2.5 seconds under a defined reasonable mobile-network test profile.

### PR-PERF-002 — Move-processing latency

| Field | Value |
|---|---|
| Type | Performance |
| Priority | Must |
| Status | Accepted as initial target |
| Source | S002-D57 |

Server-side move-request processing should complete below 100 milliseconds at the 95th percentile, excluding network latency.

Under normal supported conditions, an accepted move should normally be reflected in the opponent's browser within 500 milliseconds.

### PR-PERF-003 — Initial capacity target

| Field | Value |
|---|---|
| Type | Capacity |
| Priority | Must |
| Status | Accepted as initial target |
| Source | S002-D58 |

Before public deployment, the system must be tested against an initial target of 100 simultaneous games and 500 active connections.

## 12. Reliability and Recovery

### PR-REL-001 — Confirmed-move recovery point

| Field | Value |
|---|---|
| Type | Reliability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D59 |
| Implementation risk | High |

The recovery-point objective for confirmed moves is zero accepted moves lost.

### PR-REL-002 — Active-game recovery time

| Field | Value |
|---|---|
| Type | Reliability |
| Priority | Must |
| Status | Accepted as initial target |
| Source | S002-D60 |
| Implementation risk | High |

After a service restart, active games should be recoverable within five minutes.

### PR-REL-003 — Availability measurement

| Field | Value |
|---|---|
| Type | Reliability and operations |
| Priority | Must |
| Status | Accepted |
| Source | S002-D61 |

The MVP has no contractual availability SLA. Production availability and error rates must nevertheless be measured and reported.

## 13. Observability

### PR-OBS-001 — Operational telemetry

| Field | Value |
|---|---|
| Type | Operability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D62 |

The system must provide structured logs, metrics, and error tracing sufficient to observe connections, active games, accepted and rejected moves, latency, failures, and recoveries.

### PR-OBS-002 — Correlation

| Field | Value |
|---|---|
| Type | Operability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D63 |

Relevant requests and events must carry correlation identifiers that support investigation without exposing session credentials.

## 14. Browser Compatibility

### PR-COMP-001 — Supported browsers

| Field | Value |
|---|---|
| Type | Compatibility |
| Priority | Must |
| Status | Accepted |
| Source | S002-D64 |

The MVP must support the two most recent major versions of Chrome, Firefox, Safari, and Edge at the time of release.

### PR-COMP-002 — Unsupported capability feedback

| Field | Value |
|---|---|
| Type | Compatibility and usability |
| Priority | Must |
| Status | Accepted |
| Source | S002-D65 |

When an essential capability is unavailable in a browser, the application must fail safely and provide a clear explanation rather than silently malfunction.

## Target Revision Rule

Initial quantitative performance, capacity, and recovery targets may be revised when experiments provide stronger evidence. Revisions must record the evidence, impact, rationale, and Yasmany's approval; targets must not be silently weakened to make an implementation appear complete.

## 15. End-to-End MVP Acceptance Journeys

### AJ-001 — Temporary identity and lobby

Two browsers claim globally unique temporary names and enter the public lobby. A conflicting case-insensitive name claim is rejected with clear feedback.

### AJ-002 — Create and join a game

One player creates a public waiting game and another joins it. A competing concurrent join is rejected. The game starts with identical authoritative assignment and state for both players.

### AJ-003 — Complete legal play

Both players complete legal move sequences that collectively verify ordinary moves, castling, en passant, and promotion. Illegal and out-of-turn requests are rejected. Position, turn, notation, status, and applicable clocks remain synchronized.

### AJ-004 — Terminal outcomes

Tests verify checkmate; claim-based threefold repetition and fifty-move draws; automatic fivefold repetition, seventy-five-move, stalemate, and dead-position draws; resignation; agreed draw; abandonment; and timeout, including the no-possible-legal-mate exception.

### AJ-005 — Reconnection and service recovery

A player reloads or loses connectivity, recovers the temporary identity and active game, and receives authoritative state. A service restart recovers active games without losing a confirmed move.

### AJ-006 — Public history and replay

A terminal game appears in public history, can be found using supported filters, presents its metadata and result, and can be replayed completely.

### AJ-007 — PGN interoperability

A completed game can be copied and downloaded as valid PGN. A valid imported PGN opens in private replay without public persistence. Invalid PGN produces useful feedback.

### AJ-008 — Multilingual journeys

The preceding user journeys operate in English, Spanish, and French with appropriate locale formatting and complete user-facing translation.

### AJ-009 — Accessible operation

Identity entry, lobby, gameplay, clocks, feedback, and replay are operable by keyboard and assistive technology without relying solely on color.

### AJ-010 — Responsive browser compatibility

Core journeys operate in supported Chrome, Firefox, Safari, and Edge versions across representative desktop, tablet, and mobile web viewports.

### AJ-011 — Trust-boundary enforcement

Attempts to forge identity, turn, movement, clock, or result are rejected without corrupting authoritative state. Session credentials do not appear in telemetry.

### AJ-012 — Quality-attribute validation

Defined tests and production-like measurements demonstrate or transparently qualify the accepted capacity, latency, web-performance, and recovery targets.

## Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Project owner | Yasmany | Accepted | 2026-08-17 |
| AI collaborator | Codex | Interviewed and drafted | 2026-08-17 |

## Revision History

| Version | Date | Change | Decision owner |
|---|---|---|---|
| 0.1 | 2026-08-17 | Requirements elicitation draft opened. | Yasmany |
| 1.0 | 2026-08-17 | Requirements and end-to-end acceptance journeys reviewed and accepted. | Yasmany |
| 1.1 | 2026-08-18 | Corrected repetition, move-count, dead-position, and timeout semantics using FIDE Laws of Chess articles 6.9 and 9.2–9.6. | Yasmany |

## Normative Chess Rules Reference

MVP standard-chess semantics use the [FIDE Laws of Chess effective from 1 January 2023](https://handbook.fide.com/chapter/e012023) as the initial normative reference. Product-specific online interaction rules must identify any deliberate variation rather than being presented as FIDE behavior.

## Deferred Alternatives

### Private invitation links

Joining through a private invitation link was proposed but not selected for the current MVP requirements. The initial join mechanism will use the public list of available games.
