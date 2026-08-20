# Session 001 — Human–AI Working Agreement

## Session Metadata

| Field | Value |
|---|---|
| Date | 2026-08-16 |
| Status | Completed |
| Human participant | Yasmany |
| AI collaborator | Codex |
| Working language | Spanish |
| Artifact language | English |

## Objective

Define and approve the operational rules governing decision authority, AI autonomy, delegation, implementation, verification, and human acceptance throughout the project.

## Context

The accepted Project Charter establishes that AI will perform implementation work while Yasmany retains final decision authority. A more precise working agreement is required before product requirements, architecture, or implementation work begins.

## Interview Progress

The first interview block addressed how AI should request decisions and whether recurring decisions may later be delegated.

Yasmany stated that AI should initially ask him about decisions. The approval interaction should allow Yasmany to authorize AI to make future decisions that are similar to the one being considered.

## Decisions

| ID | Decision | Owner | Status |
|---|---|---|---|
| S001-D01 | AI must initially ask Yasmany when a decision is required. | Yasmany | Accepted |
| S001-D02 | A decision request may offer Yasmany the option to delegate materially similar future decisions to AI. | Yasmany | Accepted |
| S001-D03 | Reusable authority must be explicit, scoped, documented, and revocable. It cannot be inferred from silence or one-time approval. | Yasmany | Accepted |
| S001-D04 | AI must inform Yasmany whenever it acts under previously delegated authority. | Yasmany | Accepted |
| S001-D05 | High-impact decisions always require explicit human approval, including fundamental scope, primary technology, overall architecture, material costs, production deployment, real credentials or data, destructive operations, major risk acceptance, and legal or licensing decisions. | Yasmany | Accepted |
| S001-D06 | Within an approved task, AI may autonomously make small technical adjustments that do not change scope or architecture. | Yasmany | Accepted |
| S001-D07 | Every implementation task must include testing, formatting and static analysis, review, relevant documentation, verification evidence, and disclosure of known limitations, with depth proportional to risk. | Yasmany | Accepted |
| S001-D08 | AI may use specialized agents, provided significant contributions are traceable and one coordinating authority remains responsible for integration. | Yasmany | Accepted |
| S001-D09 | A task cannot be marked complete without adequate verification; missing verification must be disclosed and the task must remain open or explicitly blocked. | Yasmany | Accepted |
| S001-D10 | Work will be organized through tracked tasks and dedicated branches rather than direct changes to the main branch. | Yasmany | Accepted |
| S001-D11 | Commits will be coherent and purposeful without attempting to represent every AI interaction. | Yasmany | Accepted |
| S001-D12 | Significant changes will use documented pull requests containing implementation, decision, verification, risk, AI-attribution, and applicable visual evidence. | Yasmany | Accepted |
| S001-D13 | AI will review complete changes, while Yasmany retains final approval for significant integrations and milestones. | Yasmany | Accepted |
| S001-D14 | Relevant failures belong in process records; Git history need not retain every broken intermediate attempt. | Yasmany | Accepted |
| S001-D15 | The public repository's main branch will use appropriate protection and required checks. | Yasmany | Accepted |
| S001-D16 | Tasks will be classified as low, medium, high, or critical risk, with review, verification, and approval requirements increasing by level. | Yasmany | Accepted |
| S001-D17 | AI will propose and record the initial risk classification; uncertainty between levels will be resolved by using the higher level. | Yasmany | Accepted |
| S001-D18 | A task is Done only when acceptance, implementation, risk-based testing, build and static checks, review, documentation, evidence, risk disclosure, traceability, defect, and applicable human-approval gates are satisfied. | Yasmany | Accepted |
| S001-D19 | A milestone is Done only when its mandatory tasks are Done, the integrated result is demonstrated and tested, cross-cutting concerns and project documents are reviewed, and Yasmany formally accepts it. | Yasmany | Accepted |
| S001-D20 | Sessions will identify human, model, coordinating-agent, subagent, tool, artifact, and code attribution when available, without inventing unavailable metadata. | Yasmany | Accepted |
| S001-D21 | AI must disclose material uncertainty and request a human decision when a significant choice remains unresolved. | Yasmany | Accepted |
| S001-D22 | The coordinating agent must explain contradictory agent recommendations, compare evidence, recommend an option, and escalate significant decisions to Yasmany. | Yasmany | Accepted |
| S001-D23 | Significant security, licensing, compatibility, and technical claims require sources, inspection, or experiments rather than AI memory alone. | Yasmany | Accepted |
| S001-D24 | Relevant AI errors will be documented; trivial wording, spelling, or formatting corrections need not become historical incidents unless materially consequential. | Yasmany | Accepted |
| S001-D25 | The complete Human–AI Working Agreement version 1.0 is accepted. | Yasmany | Accepted |

## Current Delegations

No reusable decision authority has been delegated yet.

## Open Questions

None within the scope of this session.

## Next Step

Begin requirements elicitation through a dedicated product-requirements interview.
