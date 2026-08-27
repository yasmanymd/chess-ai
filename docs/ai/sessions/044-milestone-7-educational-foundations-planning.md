# Session 044 — M7 Educational Foundations Planning

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date         | 2026-08-27                                                 |
| Milestone    | Milestone 7 — Educational Foundations                      |
| Participants | Yasmany (decision owner), Codex (implementation assistant) |
| Status       | Completed — approved by Yasmany on 2026-08-27              |

## Objective

Choose the smallest educational vertical slice that creates real learning value while preserving the platform's server-authority principle and public, reproducible development process.

## Decisions Recorded

1. Begin with public study positions rather than courses, accounts, tournaments, or a general analysis engine.
2. Store six editorial exercises in version-controlled fixtures: two mate-in-one, two win-material, and two best-move positions.
3. Use a single accepted move per exercise for the first release. Variations and multi-move lines remain deferred.
4. An incorrect attempt produces a short hint and a retry from the original position; a correct attempt produces an explanation and next-exercise action.
5. Store completion only in browser-local storage, with a confirmed local reset action.
6. Add public Study navigation, catalog, and exercise routes while keeping the multiplayer lobby independent.
7. Keep the server authoritative: it validates an exercise identifier and normalized move through the chess rules boundary.
8. Orient every exercise from the solver's side and preserve matching board coordinates.
9. Keep every prompt, hint, explanation, and answer fixed, translated editorial content. Do not integrate Stockfish or real-time AI generation.

## Rationale

This scope proves the educational direction without implying that dynamic machine-generated analysis is pedagogically correct. It uses the trusted chess-rules boundary already established for multiplayer play, gives learners useful feedback, and creates a catalog format that can later evolve into courses, variations, and authored material.

## Rejected or Deferred Alternatives

| Alternative                                  | Decision | Reason                                                                                                                         |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Accounts and synchronized progress           | Deferred | They add identity, privacy, and product-scope decisions unrelated to proving the first learning interaction.                   |
| Real-time Stockfish or AI explanations       | Deferred | They introduce hosting, cost, correctness, and disclosure obligations. Fixed editorial content is reviewable and reproducible. |
| Client-authoritative answer checks           | Rejected | The browser could be modified to claim completion incorrectly and would violate the server-authority principle.                |
| Multiple variations and multi-move exercises | Deferred | One accepted move establishes the interaction and validation flow with a bounded initial catalog.                              |

## Next Step

Implement M7.3: local browser progress, a confirmed local reset action, and browser evidence for the complete learning journey.

## M7.1 Delivery and Evidence

- Added a typed, project-owned catalog of the six approved exercises. Each record contains a stable identifier, category, FEN, solver color, normalized solution move, and English, Spanish, and French editorial copy.
- Added public server read endpoints that intentionally omit solutions from catalog responses.
- Added an authoritative study-attempt endpoint. It validates the submitted move through the chess rules port before comparing it with the server-owned solution. Correct attempts receive an explanation; legal non-solutions receive a localized hint; illegal and unknown attempts receive safe error codes.
- Added tests that validate every fixture solution, a legal incorrect attempt, and rejected invalid or unknown attempts.
- Server unit tests and type checking passed on 2026-08-27: 7 test files and 22 tests passed.

## Correction During Validation

An initial test treated the legal queen move `Qf8` as illegal. The chess-rules adapter correctly classified it as legal, so the test was corrected to use an actually illegal king move into attack. This was a test-assumption correction; no production behavior was changed.

## M7.2 Delivery and Evidence

- Added public Study navigation, a multilingual catalog, and a route for each individual exercise.
- Added a solver-oriented interactive board with matching coordinates and the project's standard chess-piece assets.
- The browser submits attempted moves to the authoritative server endpoint; it receives either an editorial explanation or a localized retry hint.
- Corrected client language initialization so a `lang` query parameter takes effect before hydration. This avoids a server/client language mismatch that could leave an interactive route unstable when a browser had a different persisted language.
- The web typecheck passed on 2026-08-27. Browser evidence confirmed both the correct-answer and legal-wrong-answer journeys.

## M7.3 Delivery and Evidence

- Added local-only completion tracking with `localStorage`, including a visible completed/total summary and a textual completion badge on catalog cards.
- Added a discreet reset action that asks the browser user to confirm before deleting only the local study-progress record.
- Added an end-to-end browser test that covers retry feedback, accepted solution feedback, progress persistence, and confirmed reset on a phone-sized viewport.
- Rebuilt and executed the Playwright test image on 2026-08-27: all seven browser tests passed.

## Milestone Status

The approved Milestone 7 scope is implemented, has automated evidence, and passed Yasmany's visual review on desktop and phone. Yasmany approved its completion on 2026-08-27.
