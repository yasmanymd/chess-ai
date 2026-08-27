# Milestone 7 — Educational Foundations Plan

| Field          | Value                                 |
| -------------- | ------------------------------------- |
| Status         | Completed — approved on 2026-08-27    |
| Milestone      | Milestone 7 — Educational Foundations |
| Date           | 2026-08-27                            |
| Decision owner | Yasmany                               |

## Objective

Deliver the first public educational capability for Chess AI: a focused catalog of study positions where a learner selects a move and receives authoritative, multilingual feedback. The milestone creates a reusable learning foundation without accounts, authoring tools, real-time AI generation, or a chess-engine dependency.

## Approved Decisions

| ID     | Decision                  | Approved behavior                                                                                                                                                        |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M7-D01 | First learning format     | A study position contains a chess position, a prompt, and one accepted move. The learner attempts the move on the board.                                                 |
| M7-D02 | Initial catalog ownership | Six public exercises are stored as small version-controlled application fixtures. There is no administration UI or account requirement.                                  |
| M7-D03 | Initial answer model      | Each exercise accepts exactly one correct move. Variations and multi-move lines are deferred.                                                                            |
| M7-D04 | Incorrect answer          | Show a short hint and let the learner retry from the same position. Do not reveal the answer immediately.                                                                |
| M7-D05 | Correct answer            | Show a concise editorial explanation and offer the next exercise.                                                                                                        |
| M7-D06 | Progress                  | Persist completion locally in the current browser with `localStorage`; do not synchronize it across devices or users.                                                    |
| M7-D07 | Catalog composition       | Publish two mate-in-one, two win-material, and two find-the-best-move exercises. Each has FEN, title, prompt, solution, and explanation in English, Spanish, and French. |
| M7-D08 | Navigation                | Add a public Study entry to the application navigation and provide catalog and per-exercise routes. The lobby remains a separate experience.                             |
| M7-D09 | Validation authority      | The server validates attempts using the exercise identifier and submitted move. The browser displays outcomes but does not decide correctness.                           |
| M7-D10 | Board orientation         | Orient the study board from the solver's side: White below for White-to-move exercises and Black below for Black-to-move exercises. Coordinates follow that orientation. |
| M7-D11 | Progress reset            | The catalog exposes a discreet reset action with confirmation. It deletes only local study progress in that browser.                                                     |
| M7-D12 | Content source            | Prompts, hints, explanations, and solutions are fixed editorial content in the repository. No Stockfish or real-time AI generation is used in this milestone.            |

## Architecture

### Exercise Catalog

The catalog is a project-owned, typed fixture collection. Each record includes a stable public identifier, category, FEN, solver color, solution move in a language-neutral representation, and localized editorial text. Fixtures are intentionally small and reviewable in pull requests.

### Validation Flow

1. The browser loads an exercise definition suitable for presentation but never receives authority to declare an answer correct.
2. The learner selects a legal board move.
3. The browser submits the exercise identifier and normalized move to a Study server endpoint.
4. The server loads the project-owned exercise, validates its position and submitted move through the existing chess rules boundary, and returns `correct` or `incorrect` with the appropriate approved feedback.
5. The browser records completion locally only after an authoritative correct response.

### Boundaries

- The Study module owns exercise definitions, validation policy, and localized editorial feedback.
- The existing chess rules port remains responsible for legal-move semantics.
- Web routes render catalog state, board interaction, and local progress; they do not embed a second rules engine or solution authority.
- Temporary identity, lobby, active games, archive, and PGN interchange remain independent modules.

## Delivery Slices

### M7.1 — Catalog and Authoritative Study Contract — Implemented and validated

- Define typed exercise fixtures and the server validation contract.
- Add six reviewed exercises and validate every FEN and solution during tests.
- Add unit and integration coverage for accepted, rejected, malformed, and mismatched attempts.

**Validated evidence:** The server unit suite passed on 2026-08-27 with 22 tests, including a new study-attempt suite. It proves that all six fixture solutions are legal, that a legal non-solution receives a localized hint, and that illegal or unknown attempts are not accepted.

### M7.2 — Study Catalog and Exercise Experience — Implemented and validated

- Add Study navigation, catalog cards, per-exercise route, solver-oriented board, attempt feedback, and next-exercise flow.
- Provide English, Spanish, and French resources and responsive phone/desktop layouts.

**Validated evidence:** The web typecheck passed on 2026-08-27. Browser interaction evidence confirmed both a correct move and a legal incorrect move: the former returns the editorial explanation and the latter returns a localized retry hint. A hydration correction also ensures that a URL-selected language is applied before the client attaches, avoiding an interaction-breaking server/client language mismatch.

### M7.3 — Local Progress and Evidence — Implemented and validated

- Persist completion locally, expose reset with confirmation, and make completed/pending catalog status understandable without color alone.
- Add browser evidence for the core success and retry journeys, localization, orientation, and local persistence.
- Publish a work-session record and milestone closure evidence.

**Validated evidence:** The Playwright suite passed on 2026-08-27 with seven tests. The new responsive study test covers an incorrect legal attempt, retry feedback, a correct authoritative answer, local completion persistence, and reset after browser confirmation.

## Explicitly Deferred

- Registered users, cloud progress synchronization, profiles, achievements, or shared statistics.
- Authoring, publishing, moderation, and management interfaces for exercises.
- Multiple correct variations, multi-move lines, adaptive curricula, courses, and coaching workflows.
- Stockfish, a remote engine, real-time AI generation, or a claim that generated analysis is authoritative.
- Private or paid learning content.

## Exit Criteria

1. The catalog contains the approved six multilingual public exercises.
2. The server accepts only the approved legal solution for each exercise and responds safely to invalid attempts.
3. Incorrect and correct feedback follows the approved behavior on desktop and phone.
4. Orientation, coordinates, locale switching, and local progress behave consistently.
5. Automated evidence proves the core study flow and the architecture preserves server authority.

## Completion Record

Yasmany completed the desktop and phone visual review and approved Milestone 7 on 2026-08-27. The approved scope, automated evidence, and documented constraints satisfy the milestone exit criteria.
