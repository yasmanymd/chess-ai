# Milestone 2 — Temporary Identity and Public Lobby Plan

## Document Control

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Status         | Implemented — validation in progress       |
| Version        | 1.0                                        |
| Decision owner | Yasmany                                    |
| Source         | Session 017                                |
| Date           | 2026-08-21                                 |
| Milestone      | Milestone 2 — Temporary Identity and Lobby |

## Objective

Deliver an accountless, two-browser flow in which temporary players claim globally unique display names, enter the public lobby, create or join a waiting game, and arrive at a non-interactive active-game shell.

Yasmany approved this plan on 2026-08-21.

## Accepted Decisions Applied

| Area                 | Applied decision                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Temporary session    | An opaque credential is sent only through an `HttpOnly`, `SameSite=Lax` session cookie. The server stores a cryptographic digest, never the raw credential.    |
| Environment security | The cookie requires `Secure` in HTTPS environments. Only explicit local HTTP development configuration may omit it for LAN preview.                            |
| Name uniqueness      | The server trims, applies Unicode NFKC, uses locale-independent lowercase comparison, and enforces uniqueness in PostgreSQL while retaining the display value. |
| Entry transition     | A successful name claim redirects to a dedicated lobby route.                                                                                                  |
| Game options         | The first choices are `No clock`, `Rapid 10+0`, and `Blitz 5+3`; M2 stores and displays them but does not run clocks.                                          |
| Transport            | HTTP owns queries and mutations. Socket.IO delivers non-mutating notifications only.                                                                           |
| Match transition     | `game.started` is delivered privately to both matched identities and navigates both to `/games/:id`.                                                           |

## Delivery Slices

### M2.1 — Temporary Identity Foundation

**Outcome:** A valid browser can claim and resume a private temporary identity.

- Add the `temporary_identity` module with name normalization, validation, claim, resume, release, and expiry application services.
- Add PostgreSQL persistence for the identity ID, display name, normalized unique name, session digest, lifecycle state, timestamps, and lobby-reservation expiry.
- Add a migration with a database unique constraint on the normalized name.
- Add configuration for session-cookie name and production/development `Secure` behavior.
- Implement `POST /temporary-identities` to claim a name and set the opaque cookie.
- Implement `GET /temporary-identities/me` to recover the current identity from the cookie.
- Return stable public errors such as `DISPLAY_NAME_INVALID`, `DISPLAY_NAME_UNAVAILABLE`, and `TEMPORARY_IDENTITY_REQUIRED`.
- Replace the visual name dialog behavior with the real claim flow, localized in English, Spanish, and French.

**Evidence:** Unit tests cover normalization and validation; PostgreSQL integration tests prove global case-insensitive uniqueness; two browser contexts prove that a second claim cannot take an active name and that a reload resumes the first identity.

### M2.2 — Waiting-Game Lobby

**Outcome:** An identified player sees a current public list of joinable games and can create or cancel one.

- Add the `lobby` module and its database ownership boundary.
- Persist waiting-game ID, creator identity, optional/generated title, color preference, time control, created time, and waiting status.
- Add `GET /lobby/waiting-games`, `POST /lobby/waiting-games`, and `DELETE /lobby/waiting-games/:id`.
- Enforce that one temporary identity cannot own or join more than one waiting or active game.
- Generate a title from the creator display name when the title is omitted.
- Add `/lobby` with accessible creation controls, waiting-game cards, empty state, loading state, and localized safe errors.
- Emit a public `lobby.changed` notification after a waiting-game create, cancel, expiry, or successful match. Clients refetch the authoritative list through HTTP.

**Evidence:** HTTP and browser tests cover create, visibility, cancellation, default title, time-control display, and preventing an identity with an existing game from creating another one.

### M2.3 — Atomic Joining and Active-Game Shell

**Outcome:** Two independent identities can join one waiting game exactly once and see the same initial active-game representation.

- Add a coordinated database transaction that atomically claims a waiting game, creates the minimal active-game record, assigns colors, and prevents a second opponent.
- Add `POST /lobby/waiting-games/:id/join` with a stable conflict result for a stale or already-matched game.
- Create a minimal `game` read model only for M2: game ID, two identity snapshots, assigned colors, configured time control, and `active` status. It has no move, position, clock, or rules authority yet.
- Authenticate Socket.IO connections from the temporary-session cookie and place each validated identity in a private room.
- Broadcast `lobby.changed` after matching and privately emit `game.started` to both player rooms.
- Add `GET /games/:id` and the `/games/:id` route. Render a non-interactive initial board, player names, colors, time control, and a localized notice that moves arrive in Milestone 3.

**Evidence:** Two isolated browser contexts claim different names, create and join the same game, receive matching authoritative player/color/time-control data, and navigate to the same game route. A concurrency test proves only one simultaneous join succeeds.

## Public Contract Rules

- All mutation requests are validated with Zod at the transport boundary.
- HTTP mutations return stable codes and safe localized client messages; they never return raw exception text or credential material.
- The browser never receives a raw session credential, database connection information, or internal identity/session digest.
- Display names are public only where the product requires them: lobby cards and player presentation.
- The temporary-session cookie authenticates the browser; a display name alone never authorizes a request.

## Deferred Work

- Clocks, moves, legal-move calculation, chess state, and results belong to Milestone 3.
- Durable event/outbox delivery, restart recovery, and full reconnection handling belong to Milestone 4.
- Registered accounts, spectator mode, tournaments, course content, and moderation remain outside this milestone.

## Exit Evidence

1. Two browser contexts use distinct names, and a case-insensitive duplicate claim fails safely.
2. Refreshing the browser restores the same temporary identity during the session.
3. The public lobby shows joinable waiting games and updates after a mutation.
4. A creator can cancel a waiting game; a player cannot hold more than one waiting or active game.
5. Concurrent join attempts admit exactly one opponent.
6. Both admitted players reach the same active-game shell with consistent color and time-control information.
7. Unit, integration, browser, accessibility, localization, architecture, and container checks pass for the new slices.
