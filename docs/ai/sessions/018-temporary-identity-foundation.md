# Session 018 — Temporary Identity Foundation

## Session Metadata

| Field             | Value                                      |
| ----------------- | ------------------------------------------ |
| Date              | 2026-08-21                                 |
| Status            | In progress                                |
| Human participant | Yasmany                                    |
| AI collaborator   | Codex                                      |
| Working language  | Spanish                                    |
| Artifact language | English                                    |
| Milestone         | Milestone 2 — Temporary Identity and Lobby |

## Objective

Begin the approved M2.1 vertical slice by establishing the server-side identity schema and deterministic display-name rule before exposing an HTTP claim endpoint.

## Implementation

- Added a PostgreSQL migration for temporary identity records with UUID identity, original display name, normalized unique name, session digest, lifecycle status, and timestamps.
- Added a typed database schema for the temporary identity table.
- Added display-name validation that trims input, applies Unicode NFKC, accepts the approved character set, enforces the 2–30 character range, and derives a locale-independent lowercase comparison value.
- Added unit tests for valid international names, case-insensitive normalization, trimming, punctuation rejection, and boundary lengths.

## Verification and Evidence

| Check                         | Result                |
| ----------------------------- | --------------------- |
| Temporary-identity unit tests | Passed: 6 tests       |
| Server unit tests             | Passed: 7 tests total |
| Server TypeScript typecheck   | Passed                |

## Progress Update

- Added the initial `POST /temporary-identities` transport path, backed by the temporary-identity claim application service.
- The service creates a high-entropy opaque credential, stores only its SHA-256 digest, and returns the raw credential only to the cookie-delivery boundary.
- Duplicate normalized names return the stable `DISPLAY_NAME_UNAVAILABLE` code; invalid names return `DISPLAY_NAME_INVALID`.
- The cookie delivery boundary emits `HttpOnly`, `SameSite=Lax`, path-scoped session cookies and applies `Secure` unless explicit local development configuration disables it.
- A TypeScript schema correction was required after validation: PostgreSQL-generated timestamps are now represented as generated columns rather than required application inputs.

## Updated Verification and Evidence

| Check                         | Result                |
| ----------------------------- | --------------------- |
| Temporary-identity unit tests | Passed: 6 tests       |
| Server unit tests             | Passed: 7 tests total |
| Server TypeScript typecheck   | Passed                |

## Next Step

Add restricted credentialed CORS, execute the migration against PostgreSQL, validate the claim endpoint end-to-end, then implement temporary-identity resume.
