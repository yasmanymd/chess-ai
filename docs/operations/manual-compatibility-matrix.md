# Manual Compatibility Matrix

| Field        | Value                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- |
| Status       | M6.4 evidence record; remaining cells are explicit pending work                               |
| Scope        | Critical MVP journeys on the local-network development environment                            |
| Owner        | Yasmany for physical-device observations; Codex for automated evidence and record maintenance |
| Last updated | 2026-08-27                                                                                    |

## Critical Journeys

1. Choose or recover a temporary identity; create and join a public table.
2. Play a legal two-player game, including live opponent updates, orientation, coordinates, clocks, completion, and return to lobby.
3. Change the interface language while preserving the active route.
4. Browse the public archive, replay a completed game, and download its PGN.
5. Paste or upload one supported PGN and use replay controls.

## Recorded Evidence

| Environment                        | Locale coverage   | Critical journey evidence                                                                                                   | Status                         | Source                                                                 |
| ---------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| Chrome desktop on local network    | English, Spanish  | Identity, lobby, live game updates, clocks, game completion, archive/replay, and PGN import/export were observed.           | Observed during implementation | Sessions 024, 025, 037 and product review conversations                |
| Safari desktop on local network    | English, Spanish  | Two-player play, live updates, board orientation, clock behavior, game completion, archive/replay, and PGN import observed. | Observed during implementation | Sessions 024, 025, 037 and product review conversations                |
| iPhone Safari on local network     | English, Spanish  | Initial shell, progressive identity/lobby controls, language selection, responsive game display, and API recovery observed. | Observed during implementation | Sessions 011, 012, 014, 016, 023, 024 and product review conversations |
| Chrome desktop and Safari desktop  | French            | Automated translated-route, accessibility, and responsive checks passed; physical final-pass observation is pending.        | Pending manual confirmation    | M6.4 Playwright suite and this matrix                                  |
| iPhone Safari                      | French            | Automated translated-route, accessibility, and responsive checks passed; physical final-pass observation is pending.        | Pending manual confirmation    | M6.4 Playwright suite and this matrix                                  |
| Firefox, current supported version | All three locales | No manual environment has been supplied.                                                                                    | Explicitly pending             | M6-D09                                                                 |
| Edge, current supported version    | All three locales | No manual environment has been supplied.                                                                                    | Explicitly pending             | M6-D09                                                                 |

## Completion Procedure

For every pending Chrome or Safari cell, use one clean browser session per locale and record browser/version, device or viewport, date, journey result, and any defect link. Do not infer physical-browser success from Playwright alone.

The first Firefox and Edge physical checks should follow the same procedure once those environments are available. Their absence is an explicit public-release blocker because the product requirement targets the two current major versions of Chrome, Firefox, Safari, and Edge.
