# Legacy Project Assessment: `chess-sol`

## Document Control

| Field             | Value                    |
| ----------------- | ------------------------ |
| Status            | Reference                |
| Version           | 0.1                      |
| Assessment method | Static repository review |
| Reviewed by       | Codex                    |
| Human context     | Yasmany                  |

## Purpose

The existing `chess-sol` project is a conceptual and historical reference for the new platform. The new project will start from scratch and will not treat the legacy implementation as its architectural baseline.

## System Composition

The legacy solution contains:

1. A React and Redux portal for playing chess.
2. A Node.js, Express, and Socket.IO server for lobby coordination and action relay.
3. A Go REST API using Chi and sqlx for persistence.
4. A PostgreSQL database.
5. A separate React viewer for completed games.

## Valuable Ideas

- Bitboards provide a compact and efficient representation of chess positions.
- Real-time game actions can synchronize two browser clients.
- Active play and historical viewing can be separated as user experiences.
- Game movements can be persisted in a structured representation.
- Repository interfaces and database migrations provide useful backend boundaries.

## Limitations Relevant to the New Project

- Chess rules are validated by clients rather than an authoritative server.
- The real-time server relays arbitrary client actions without validating legality, ownership, or turn order.
- Each browser computes its own state, which can diverge after missing actions or reconnecting.
- Active games are stored in process memory and are lost on restart.
- Move history is temporarily stored in browser-global state.
- Persistence of the final game is initiated by one client.
- Reload and reconnection recovery are incomplete.
- Service addresses are hard-coded to localhost.
- CORS is unrestricted.
- Authentication and authorization are absent.
- Express routes are registered inside the Socket.IO connection handler, causing repeated handler registration.
- The technology stack is outdated.
- Automated coverage is limited, particularly around chess rules and real-time synchronization.
- The strategy/opening functionality appears incomplete and unused by the portal.

## Lessons Carried Forward

The new project should evaluate:

- A server-authoritative game model.
- A tested, established chess rules library.
- Explicit recovery and reconnection semantics.
- Persistent or recoverable active game state.
- Environment-based configuration.
- Security and authorization boundaries.
- Comprehensive chess-domain and synchronization tests.
- Internationalization from the first user-interface foundation.
- PGN, FEN, and SAN interoperability.

This document records lessons, not final architecture decisions.
