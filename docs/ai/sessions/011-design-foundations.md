# Session 011 — Design Foundations and Theme Strategy

## Session Metadata

| Field             | Value                            |
| ----------------- | -------------------------------- |
| Date              | 2026-08-20                       |
| Status            | In Progress                      |
| Human participant | Yasmany                          |
| AI collaborator   | Codex                            |
| Working language  | Spanish                          |
| Artifact language | English                          |
| Milestone         | Milestone 1 — Product Experience |

## Objective

Establish the visual-design process and durable theming strategy before designing the first playable product flows.

## Context

Yasmany wants AI assistance with visual design because he is not a graphic designer. The project will be public and should document both the human decisions and the AI-supported design process. The product also supports future personalization, including application and chessboard themes.

## Interview Summary

The initial discussion contrasted an educational, competitive-modern, and classical chess visual direction. Rather than permanently choosing a single aesthetic, Yasmany proposed a theme-based product so players can choose an appearance later. The approach was accepted as the design foundation.

## Decisions

| ID | Decision | Owner | Status |
| --- | --- | --- |
| S011-D01 | Build a themeable design system from the first web implementation. | Yasmany | Accepted |
| S011-D02 | Model application themes separately from chessboard themes. | Yasmany | Accepted |
| S011-D03 | Start with one accessible default theme; add user-selectable themes incrementally. | Yasmany | Accepted |
| S011-D04 | Make playing online the primary entry-screen action while keeping learning visible as a secondary path. | Yasmany | Accepted |
| S011-D05 | Request an anonymous player's required visible name only when they choose to create or join a game. | Yasmany | Accepted |

## Alternatives Considered

| Alternative                                                | Outcome  | Reason                                                                                                     |
| ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Commit to one permanent visual style before implementation | Rejected | It limits future personalization and does not match the product's educational and public-experiment goals. |
| Add themes only after the MVP                              | Rejected | Retrofitting semantic styling tokens later would create avoidable component churn.                         |
| Make every visual token user-configurable immediately      | Deferred | It adds product scope without benefiting the first playable flow.                                          |

## AI Contribution

Codex explained the practical distinction between visual directions, proposed a semantic-token approach, and identified the need to separate application and board themes.

## Implementation

The first responsive visual proposal is implemented in the web application.

- The entry screen makes creating or browsing a game the primary action.
- The learning path is intentionally visible but secondary.
- English, Spanish, and French content are available through the existing i18next configuration.
- The name dialog opens only after a person expresses an intent to create or browse games.
- The initial `Study` theme uses semantic application and board tokens in CSS.
- Theme selection is visible as a disabled, accurately labelled future control; it does not imply that selectable themes are already delivered.
- Server rendering is enabled so the complete, styled page is available before browser JavaScript finishes loading. This avoids an unstyled or empty view on mobile Safari during local-network development.
- The language control is a progressively enhanced form: a normal browser applies a selection immediately, while a browser without working client JavaScript exposes an Apply button and navigates to the localized server-rendered page.
- The Create and Browse controls encode the selected player intent in the URL, allowing the name form to render even when client-side event handlers are unavailable.

## Verification and Evidence

| Check                                    | Result                                                       |
| ---------------------------------------- | ------------------------------------------------------------ |
| Unit test for entry flow and name dialog | Passed                                                       |
| ESLint                                   | Passed                                                       |
| Web TypeScript typecheck                 | Passed                                                       |
| Repository TypeScript typecheck          | Blocked by an existing server integration-test type mismatch |
| Prettier                                 | Passed                                                       |
| Playwright and axe accessibility scan    | Passed after contrast correction                             |
| Responsive visual inspection             | Reviewed at desktop and 390 by 844 mobile viewport           |
| JavaScript-disabled browser flow         | Passed for language selection and name dialog                |

## AI Errors

1. The first `text-muted` and `success` tokens missed WCAG AA contrast by small margins against the warm canvas. The automated axe scan detected the problem before review. The tokens were corrected globally, rather than adding local exceptions.
2. Vitest's default discovery included Playwright files from `e2e/`. The configuration now explicitly excludes that directory so unit and browser test runners remain separate.
3. Client-only rendering sometimes left mobile Safari with an unstyled, incomplete entry screen while development modules loaded over the local network. Enabling server rendering fixed the user-visible problem. The browser test was then updated to wait for client enhancement before testing an interactive language change.
4. The first server-rendered mobile fix still required client-side events for language selection and the entry buttons. A physical-phone report exposed the gap. The entry controls now have a server-navigation fallback and the validation suite includes a JavaScript-disabled browser check.

## Risks and Limitations

- Early theme abstraction must remain small; it must not delay the first player flow.
- Every supported theme must meet accessibility contrast requirements.
- Anonymous-player theme selection can only be stored locally until account profiles exist.

## Open Questions

- Does Yasmany approve the initial Study-theme visual proposal as the baseline for the first playable flow?
- Should a theme selector ship in the first vertical slice or follow after the first flow works?

## Next Step

Obtain approval for the visual proposal, then implement the first playable anonymous-player flow.
