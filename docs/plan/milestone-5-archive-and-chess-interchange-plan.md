# Milestone 5 — Archive and Chess Interchange Plan

| Field          | Value                                       |
| -------------- | ------------------------------------------- |
| Status         | Accepted                                    |
| Milestone      | Milestone 5 — Archive and Chess Interchange |
| Date           | 2026-08-26                                  |
| Decision owner | Yasmany                                     |

## Objective

Make completed standard-chess games discoverable and replayable, while providing validated, standards-based PGN export and private ephemeral PGN import.

## Inherited Constraints

- `Game` remains the authority for completed-game facts. `Game Archive` owns only derived public query projections.
- `Chess Interchange` obtains export data through an approved archive query contract and does not read Game storage directly.
- Every completed game is public in this temporary-identity MVP.
- Imported PGN is a private, non-persisted, current-tab replay. It is never added to the public archive.
- Standard games from the normal position and valid declared `SetUp`/`FEN` positions are supported. Variants and multi-game import remain deferred.
- Interfaces, validation feedback, and replay controls support English, Spanish, and French. PGN, FEN, and SAN remain standards-based.

## Approved Product Decisions

| ID     | Decision                 | Approved behavior                                                                                                                       |
| ------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| M5-D01 | Archive visibility       | Every completed game is public.                                                                                                         |
| M5-D02 | Archive discovery        | List newest games first; filter by partial player name, result, date range, and time control; use a progressive `Load more` page model. |
| M5-D03 | PGN import               | Accept pasted PGN text and a selected `.pgn` file for one game at a time.                                                               |
| M5-D04 | Imported replay lifetime | Keep a valid import in the current browser tab only; refresh or close requires a new import.                                            |
| M5-D05 | Replay controls          | Provide previous, next, first, last, autoplay, and pause; display only the main line.                                                   |
| M5-D06 | PGN export               | Offer both copy-to-clipboard and `.pgn` download from an archived-game replay.                                                          |

## Proposed Delivery Slices

### M5.1 — Completed-Game Publication and Archive Projection — Completed 2026-08-26

**Outcome:** A terminal authoritative game creates a durable, public archive projection without granting Archive direct access to Game internals.

- Extend Game completion delivery to publish a durable completion fact with the data required by an archive projection.
- Define an Archive-owned projection table and a public application query contract.
- Consume completion facts idempotently through the existing outbox delivery mechanism.
- Backfill completed games already present in the local database through an explicit, repeatable projection operation.

**Evidence:** A terminal game creates one public projection; replaying the same completion event or backfill does not duplicate it.

**Implemented evidence:** A durable `game.completed` outbox record is written in the same transaction as every terminal move, player action, or clock timeout. The Archive consumer reads an explicit completed-game contract, writes archive-owned game and move projections, and skips an existing projection safely. Startup invokes a repeatable backfill for games completed before this event existed. Integration tests cover terminal publication, projection, duplicate projection, and backfill.

### M5.2 — Public Archive Discovery and Replay — Completed 2026-08-26

**Outcome:** Visitors can browse completed games, filter them, open one, and replay its confirmed main line deterministically.

- Add archive list and detail HTTP contracts backed only by the Archive projection and public replay contract.
- Add newest-first filtering for player name, result, date range, and time control with progressive pagination.
- Build localized archive and replay routes with accessible board, move list, first/previous/next/last controls, and autoplay/pause.
- Render a completed game from its recorded initial position and ordered confirmed moves, including a valid non-standard FEN start where applicable.

**Evidence:** Two browsers can find the same completed game through filters and produce the same replay position at every move index.

**Implemented evidence:** The public archive API reads only Archive-owned tables, offers the approved filters and stable newest-first pagination, and exposes a deterministic recorded replay. The localized web routes provide the archive list, replay board, move selection, first/previous/next/last controls, and autoplay/pause. Public API and rendered routes were checked against archived games in the local database.

### M5.3 — PGN Export Through Chess Interchange — Completed 2026-08-26

**Outcome:** An archived game is represented as valid PGN from a project-owned Chess Interchange contract.

- Define export input/output contracts between Archive and Chess Interchange.
- Generate standard PGN headers for event, site, date, round, players, result, time control, termination, and `SetUp`/`FEN` where applicable.
- Add copy and file-download actions to the archived replay UI.

**Evidence:** Exported PGN round-trips through the import validator and preserves headers, initial position, main-line SAN, and result.

**Implemented evidence:** Chess Interchange now generates PGN from Archive's public replay contract only. The public endpoint and browser download route provide a `.pgn` file, and the replay page provides a copy-to-clipboard action. Unit tests validate headers, escaped names, time control, FEN setup, main-line moves, and result; a real archived game returned valid PGN locally.

### M5.4 — Private PGN Import and Replay — Completed 2026-08-26

**Outcome:** A visitor can paste or select one PGN and immediately replay its validated main line without creating a stored public game.

- Add bounded PGN input validation for file and pasted text.
- Validate syntax, declared initial position, legal main-line moves, and result consistency through the Chess Interchange rules boundary.
- Tolerate standard comments, variations, and annotation symbols while extracting and displaying only the main line.
- Return localized, safe validation feedback for malformed or unsupported input and never persist import payloads.

**Evidence:** Normal-start and FEN-start games import successfully; malformed PGN, illegal moves, invalid FEN, inconsistent result, unsupported variants, and oversized payloads fail safely.

**Implemented evidence:** The Chess Interchange import endpoint accepts one pasted PGN and returns only a private replay representation; no imported data reaches the database or Archive. The localized Import PGN page accepts pasted text or a selected `.pgn` file, and renders the same deterministic main-line replay controls used by Archive. The parser accepts comments and variations while exposing only the main line, supports declared `SetUp`/`FEN`, bounds input to 512 KB, and returns safe codes for empty, malformed, inconsistent, oversized, and non-standard-variant input.

### M5.5 — Exit Validation and Documentation

**Outcome:** M5 has product and engineering evidence sufficient for acceptance.

- Run unit, integration, architecture, localization, accessibility, responsive browser, and PGN round-trip validation.
- Manually verify archive discovery, replay, copy/download, paste/file import, and invalid-input feedback across desktop and phone.
- Publish a concise validation session and known-limitations record.

**Evidence:** The M5 exit criteria in the implementation roadmap pass and Yasmany accepts the milestone.

## Explicitly Deferred

- Registered-account privacy controls and per-game visibility choices.
- Archive moderation, deletion, reports, ratings, comments, or social features.
- Multi-game PGN import, annotation editing/display, variation navigation, chess variants, and imported-game persistence.
- Full-text search infrastructure beyond the accepted filters.
