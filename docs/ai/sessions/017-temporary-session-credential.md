# Session 017 — Temporary Session Credential

## Session Metadata

| Field             | Value                                      |
| ----------------- | ------------------------------------------ |
| Date              | 2026-08-21                                 |
| Status            | Completed                                  |
| Human participant | Yasmany                                    |
| AI collaborator   | Codex                                      |
| Working language  | Spanish                                    |
| Artifact language | English                                    |
| Milestone         | Milestone 2 — Temporary Identity and Lobby |

## Objective

Choose the browser-session mechanism that protects an accountless temporary identity while allowing it to recover after a reload.

## Decision

| ID       | Decision                                                                                                                                                                                              | Owner   | Status   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| S017-D01 | Store the opaque temporary-session credential in a secure `HttpOnly` cookie, not in browser-accessible storage.                                                                                       | Yasmany | Accepted |
| S017-D02 | Require the `Secure` cookie attribute in HTTPS environments; allow it to be omitted only through explicit local-development configuration for the HTTP LAN preview.                                   | Yasmany | Accepted |
| S017-D03 | Use a non-persistent session cookie: it survives reloads and eligible reconnections while the browser session remains open, then is removed when the browser closes.                                  | Yasmany | Accepted |
| S017-D04 | After a valid identity claim from the public landing page, navigate the player to a dedicated lobby route where they can view and create public waiting games.                                        | Yasmany | Accepted |
| S017-D05 | Offer `No clock`, `Rapid 10+0`, and `Blitz 5+3` as the initial waiting-game time-control choices; persist and display the choice before clocks are implemented.                                       | Yasmany | Accepted |
| S017-D06 | Use HTTP for initial lobby queries and all identity/lobby commands; use Socket.IO only to notify connected clients that they should refresh the authoritative lobby state.                            | Yasmany | Accepted |
| S017-D07 | When a waiting game is matched, navigate both players to `/games/:id` and show a non-interactive initial board, players, assigned colors, time control, and a localized Milestone 3 notice.           | Yasmany | Accepted |
| S017-D08 | Normalize display names by trimming, applying Unicode NFKC, and using locale-independent lowercase comparison; enforce uniqueness on the normalized value while retaining the original display value. | Yasmany | Accepted |
| S017-D09 | Extend Socket.IO notifications with a private `game.started` event to both matched identities; it triggers navigation only and does not accept a client mutation command.                             | Yasmany | Accepted |
| S017-D10 | Let the browser call the public API directly with credentialed requests; restrict CORS to the configured web origin and defer a same-origin reverse proxy to deployment design.                       | Yasmany | Accepted |

## Rationale

- The browser sends the credential automatically on same-site requests.
- Application JavaScript cannot read the credential, reducing exposure through client-side script defects.
- The display name alone remains insufficient to recover or take over an identity.
- The server can retain only a one-way representation of the credential for validation.

## Planned Security Properties

- Generate a high-entropy opaque credential when an identity is claimed.
- Store a cryptographic digest of the credential, never the raw credential.
- Use the `HttpOnly` and `SameSite=Lax` cookie attributes.
- Use `Secure` whenever the application is served over HTTPS.
- Permit non-`Secure` cookies only in explicitly configured local HTTP development.
- Scope the cookie to the application path and provide explicit expiration and release handling.
- Do not set a persistent cookie lifetime for the first temporary-identity slice.

## Next Step

Implement the temporary-identity vertical slice.
