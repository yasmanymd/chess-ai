# Milestone 2: The Lobby Is Where Strangers Meet

A multiplayer game does not begin with the first move. It begins with a much less glamorous question: **who is this browser?**

Until Milestone 2, Chess AI had a public, multilingual door. It looked like a product, but it could not yet make a promise that matters in multiplayer software: when two people arrive, the system can tell them apart, let one wait for the other, and make sure they do not both claim the same seat.

We wanted that experience without prematurely building accounts, passwords, email verification, or a whole user-management product. The result was deliberately small: a temporary identity and a public lobby.

## A name is not authentication

The first tempting design was also the wrong one: ask for a display name and treat it as the player's identity. It is friendly, but it is not secure. Anybody could type `Yasmany` and become that person.

So the display name became only the human-facing part of the identity. The server creates an opaque session credential, sends it only in an `HttpOnly`, `SameSite=Lax` cookie, and stores only a cryptographic digest of that credential. A browser can resume its temporary identity on reload; a person cannot impersonate another player merely by knowing a visible name.

Names are still globally unique, but uniqueness required more care than a database `UNIQUE` constraint on raw text. The server trims the value, applies Unicode NFKC normalization, and compares a locale-independent lowercase form while retaining the original spelling for display. That prevents visually similar variants from quietly becoming distinct identities.

The point is not that a hobby chess app needs maximum ceremony. It is that even a lightweight feature benefits from drawing a clear line between **what people see** and **what the system trusts**.

## A lobby is a concurrency problem wearing a friendly UI

The lobby lets a player open a waiting table, see public tables, join one, or cancel their own table. It is easy to picture this as a list with buttons. The interesting part appears when two browsers press “Join” at almost the same instant.

Only one of them may become the opponent.

The server therefore treats the join operation as a PostgreSQL transaction. It locks the waiting-table row, confirms it is still available, assigns the opponent and colours, removes the waiting entry, and creates the active game as one atomic operation. One request wins; the other receives a safe response saying that the table is no longer available. There is no half-matched game and no need to trust whichever browser happened to render first.

That was a useful reminder of a recurring AI-assisted-development lesson: a polished UI proposal can hide the most important question. In this case, the question was not “How should a Join button look?” It was “What must remain true when requests collide?”

## Real-time is a notification, not the source of truth

We used HTTP for authoritative reads and mutations. Socket.IO has a narrower job: tell interested browsers that the lobby changed or that their game started. When a notification arrives, the client fetches the current state from the server.

That decision keeps reconnects and missed events boring. The lobby also has a small polling fallback for the current-game state, so a dropped notification does not strand a player on a stale screen. The server remains the authority; the browser is a view that can recover.

## The mobile correction that improved the architecture

One early enhancement tried to intercept form submissions in React. On partially loaded mobile pages, that handler could prevent the browser's ordinary form submission without completing the enhanced request. The experience was worse than either approach alone.

We removed the interception. Native HTML forms and server routes became the primary path; JavaScript can enhance them, but it is no longer required for a player to create or join a table. That correction came directly from testing the real flow across browsers and devices.

## What Milestone 2 deliberately did not do

When both players reached the active-game shell, the chessboard was still not playable. There were no clocks, no legal-move validation, and no rules engine yet. That restraint mattered. The milestone proved identity, lobby visibility, atomic matching, and delivery to both players before the complexity of chess itself arrived.

The visible result was modest: two people could choose names, meet in a public lobby, and arrive at the same game. Underneath, the project had crossed an important boundary. It was no longer merely a chess-shaped interface. It had started to become a multiplayer system.

## Sources from the build log

- [Milestone 2 plan](../plan/milestone-2-temporary-identity-and-lobby-plan.md)
- [Session 017: temporary session credential](../ai/sessions/017-temporary-session-credential.md)
- [Session 018: temporary identity foundation](../ai/sessions/018-temporary-identity-foundation.md)
- [Session 019: lobby and active-game delivery](../ai/sessions/019-lobby-and-active-game-delivery.md)
