# Session 043 — M6.4 Cross-Browser, Accessibility, and Release Evidence

| Field        | Value                                                          |
| ------------ | -------------------------------------------------------------- |
| Date         | 2026-08-27                                                     |
| Milestone    | M6.4 — Cross-Browser, Accessibility, and Release Evidence      |
| Participants | Yasmany (decision owner), Codex (implementation assistant)     |
| Status       | Accepted and validated for the approved local evaluation scope |

## Approved Scope

1. Extend automated accessibility and responsive coverage for critical public routes.
2. Record the Chrome/Safari desktop and phone matrix for English, Spanish, and French without treating unobserved cells as passed.
3. Publish a concise evidence index, known limitations record, and development narrative outline.
4. Keep provider, real HTTPS, license, privacy, terms, and the selected production observability service as visible public-release blockers.

## Initial Delivery

- Added Playwright coverage for translated home and PGN-import routes in English, Spanish, and French at a phone viewport, including Axe checks and horizontal-overflow assertions.
- Added desktop navigation coverage from home to PGN import and archive.
- Added the manual compatibility matrix, release-readiness evidence index, and known-release-limitations record.
- Added the development narrative outline for the future public retrospective.
- Rebuilt the Playwright container without cache and passed the complete suite: three tests covering translated public routes, phone viewport overflow, Axe scans, and desktop navigation.

## Follow-up: Mobile Navigation Correction

- Yasmany identified that the desktop-only `Archive` and `Import PGN` links disappeared on phone-sized screens.
- Replaced the hidden mobile navigation with a translated native `details` menu (`More`, `Más`, or `Plus`) that exposes both routes without requiring client-side JavaScript.
- Added an automated phone-viewport route test. The complete Playwright suite now passes four tests.

## Follow-up: Mobile PGN Replay Resilience

- Corrected the phone-sized import layout so the header and PGN text area remain within the viewport before client-side JavaScript is available.
- Increased the replay controls' touch targets and configured them for direct touch manipulation.
- Added automated coverage that confirms the pre-hydration import form has no horizontal overflow and that `Next` and `End` update the displayed PGN position at a phone viewport.
- The release-evidence suite now contains five focused browser checks.

## Closure

- Yasmany confirmed the remaining French physical checks in Chrome desktop, Safari desktop, and iPhone Safari on 2026-08-27.
- M6.4 is accepted and complete for the approved local evaluation scope.
- Firefox and Edge remain explicit future public-release blockers until environments are available.
