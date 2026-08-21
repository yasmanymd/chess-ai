# Session 012 — Locale Persistence

## Session Metadata

| Field             | Value                                  |
| ----------------- | -------------------------------------- |
| Date              | 2026-08-21                             |
| Status            | Completed                              |
| Human participant | Yasmany                                |
| AI collaborator   | Codex                                  |
| Working language  | Spanish                                |
| Artifact language | English                                |
| Milestone         | Milestone 1 — Public Application Shell |

## Objective

Complete the approved browser-only locale-persistence behavior for the public application shell.

## Decision

| ID       | Decision                                                                                                                           | Owner   | Status   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| S012-D01 | Persist an explicitly selected locale only in the current browser's local storage, without a server record or account association. | Yasmany | Accepted |

## Implementation

- English remains the server-rendered fallback when no explicit locale is present.
- Selecting a locale submits the existing progressive language form and records the selection as `i18nextLng` after client enhancement.
- A later visit restores a supported stored locale in that browser.
- The progressive form still exposes an Apply control when client-side JavaScript is unavailable, so locale selection remains functional on the local-network mobile preview.

## Verification and Evidence

| Check                           | Result                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| Web unit test                   | Passed                                                                                   |
| Web TypeScript typecheck        | Passed                                                                                   |
| Browser persistence check       | Passed: select Spanish, revisit the root URL, Spanish content and selector were restored |
| JavaScript-disabled locale form | Passed in the prior visual-shell validation                                              |

## AI Error and Correction

The first persistence implementation allowed the client-side i18n detector to overwrite the stored value with the server fallback before restoration ran. A browser check exposed this. The implementation now avoids replacing a stored client preference during the initial no-query render, then restores the saved locale deterministically after enhancement.

A later physical-mobile check exposed a separate timing issue: the client could hydrate before i18n had completed initialization, briefly replacing visible copy with translation keys. The client entry point now waits for the exported i18n initialization promise before hydrating the interface.

## Next Step

Implement a safe public error boundary and health visibility for the Milestone 1 shell.
