# ADR-0011: Adopt Web Internationalization with i18next

## Metadata

| Field             | Value                                      |
| ----------------- | ------------------------------------------ |
| Status            | Accepted, subject to repository validation |
| Date              | 2026-08-19                                 |
| Decision owner    | Yasmany                                    |
| AI contributor    | Codex                                      |
| Related session   | Session 008                                |
| Related decisions | ADR-0004 and ADR-0010                      |

## Context

The MVP must provide English, Spanish, and French from the first releasable version. Internationalization must be part of ordinary delivery rather than deferred translation work. It must support accessible visible UI, validation feedback, dynamic game states, pluralization, dates, times, and numbers without coupling human-language text to backend domain decisions.

## Decision

Use **i18next** with **react-i18next** in `apps/web`.

Support the locales `en`, `es`, and `fr` from the initial scaffold.

## Rules

1. English is the fallback locale and the initial locale when no supported preference is available.
2. On the first visit, the web client may detect a supported browser preference; after an explicit selection, it persists that selection in browser storage.
3. The MVP does not include locale-prefixed URLs. It provides an accessible language selector available from the normal application navigation.
4. Translation resources use feature-oriented namespaces such as `common`, `lobby`, `game`, `history`, and `errors`.
5. No user-visible interface strings are embedded directly in React components, route metadata, or client-side validation code.
6. The backend returns stable, safe error codes and structured display parameters. The client translates their user-facing form.
7. Domain events, persisted records, and Socket.IO contracts store codes and structured facts, not localized user-facing sentences.
8. Dates, times, numbers, and plural forms use the platform `Intl` APIs and i18next behavior, not hand-built formatting rules.
9. Translation keys are semantic and stable; they are not source-language English sentences used as identifiers.
10. A feature is not done until its required `en`, `es`, and `fr` resources, fallback behavior, and relevant locale tests are present.
11. Missing-key behavior is visible in development and fails the relevant quality check before release.
12. Translation files are reviewed as source code and never contain secrets, user-generated content, or business decisions hidden in prose.

## Validation

The scaffold and first vertical slice must demonstrate:

1. initial locale selection, browser-preference detection, fallback, and explicit persistence;
2. runtime switching among all three locales without losing active-game state;
3. translated lobby, game, error, and completion states;
4. plural, number, date, and time formatting in each locale;
5. keyboard-accessible language selection;
6. error-code-to-localized-message mapping without server-localized copy;
7. a quality check that detects missing or inconsistent keys;
8. browser tests across the three locales.

## Rationale

i18next and react-i18next provide mature React integration, namespace organization, locale detection options, and support for pluralization and interpolation. Keeping translation responsibility in the web client preserves server-authoritative domain logic while allowing each browser to display the same game state in its selected language.

## Consequences

### Positive

- The three required languages are designed in from the first feature.
- The backend remains language-neutral for domain behavior and durable data.
- Translation resources can grow by feature and load independently.
- Client locale changes do not change authoritative game state.

### Negative

- Every UI change has a three-locale completion cost.
- Translation key organization and review require discipline.
- Human language quality still benefits from native-speaker review later.
- Locale URLs and server-rendered localization remain deferred decisions.

## Evidence

- react-i18next documents React integration, hooks, optional language detection, and translation-resource loading.
- i18next documents namespaces for semantic and technical organization and plural handling through `Intl.PluralRules`.

Evidence was reviewed on 2026-08-19.

## AI Contribution

Codex recommended i18next with react-i18next and designed the language-neutral server/error-code boundary, namespace rules, and validation requirements.

## Human Approval

Yasmany approved trying the proposed internationalization approach on 2026-08-19.
