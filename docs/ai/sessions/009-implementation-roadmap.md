# Session 009 — Implementation Roadmap

## Session Metadata

| Field             | Value       |
| ----------------- | ----------- |
| Date              | 2026-08-19  |
| Status            | In Progress |
| Human participant | Yasmany     |
| AI collaborator   | Codex       |
| Working language  | Spanish     |
| Artifact language | English     |

## Objective

Define an incremental, evidence-driven implementation roadmap for the accepted MVP. The roadmap must produce visible product value early while preserving the required architecture and validation evidence.

## Decisions

| ID       | Decision                                                                                                                                                                                                                | Owner   | Status   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| S009-D01 | Milestone 0 is complete only after a clean checkout can start the full environment through Docker Compose, execute required checks, and demonstrate frontend and backend hot reload.                                    | Yasmany | Accepted |
| S009-D02 | The public repository will be hosted on GitHub. The CI provider and workflow design remain deferred.                                                                                                                    | Yasmany | Accepted |
| S009-D03 | Deliver a visible site and the temporary-identity/lobby experience before validating chess moves.                                                                                                                       | Yasmany | Accepted |
| S009-D04 | Adopt the proposed sequence from reproducible bootstrap through release readiness as the initial implementation roadmap.                                                                                                | Yasmany | Accepted |
| S009-D05 | Automatically run idempotent migrations against an initially empty PostgreSQL database during Compose startup; keep seed data opt-in, preserve ordinary local data, and require an explicit reset command for deletion. | Yasmany | Accepted |
| S009-D06 | Copy the contents of the portable planning folder into the root of the new repository so that `PROJECT_CHARTER.md` and `docs/` are root-level paths.                                                                    | Yasmany | Accepted |

## Current Assumptions

- Repository creation occurs only after the portable planning folder and initial roadmap are accepted.
- Every milestone produces documented evidence, tests appropriate to risk, and a session record.
- Milestones are outcome-based rather than calendar-based; no deadline is assumed.

## Accepted Roadmap

The accepted roadmap is maintained in [`../../plan/implementation-roadmap.md`](../../plan/implementation-roadmap.md).

The Milestone 0 detailed plan is maintained in [`../../plan/milestone-0-bootstrap-plan.md`](../../plan/milestone-0-bootstrap-plan.md).

## Next Step

Plan Milestone 0 in sufficient detail to create the new public GitHub repository and scaffold it without re-opening accepted architecture or technology decisions.
