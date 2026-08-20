# EXP-0004: Chess-Library Boundary

| Field            | Value                  |
| ---------------- | ---------------------- |
| Status           | Planned                |
| Owner            | AI implementation team |
| Decision owner   | Yasmany                |
| Related decision | ADR-0001               |

## Hypothesis

The selected chess library can remain behind a domain-facing adapter without leaking library-specific representations throughout transport, persistence, or UI contracts.

## Success Criteria

- Domain-facing contracts cover required legal moves, status, SAN, FEN, and PGN behavior.
- Contract and rules tests verify the adapter.
- Transport and UI do not depend directly on library-specific types.
- A representative fake or alternate implementation can satisfy the boundary in tests.

## Pending Detail

Candidate libraries and contract fixtures will be selected during stack evaluation.
