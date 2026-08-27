# Development Narrative Outline

## Purpose

This outline turns the repository evidence into a public, chronological account of
an AI-assisted software project. It is a guide for future blog posts, not a
replacement for the source documents, commits, tests, or decision records.

## Editorial principles

- Describe what was decided, why it was decided, and the evidence used to verify it.
- Distinguish the human decision maker from the AI implementation assistant.
- Link to durable repository artifacts instead of reproducing long conversations.
- Include rejected proposals and defects when they changed a decision or process.
- Never publish secrets, recovery codes, private URLs, or personal data captured during testing.

## Suggested series

### Day 0 — Framing the project

- Product intent: a public multiplayer chess platform that can grow into an educational tool.
- Working agreement: documentation in English; conversations in Spanish; Yasmany approves material decisions.
- Evidence: project charter, decision policy, and initial architecture records.

### Architecture — Making the server authoritative

- Explain why legal moves, clocks, and game outcomes belong on the server.
- Show the boundaries between the web client, API, real-time transport, game engine, and persistence.
- Evidence: architecture documents, ADRs, and integration tests.

### Development environment — A container-first workspace

- Explain the monorepo, Docker Compose workflow, PostgreSQL, and live reload.
- Include the LAN access investigation as an example of diagnosing environment issues with evidence.
- Evidence: compose configuration, setup guide, and operations notes.

### Product increments — From lobby to complete games

- Present the milestones in order: temporary identity, lobby, authoritative play, clocks, archives, and PGN replay.
- For each increment, record the acceptance criteria, visible product change, tests, and defects found on real devices.
- Evidence: milestone plans, session records, screenshots, commits, and test output.

### Design iteration — Learning from real-device feedback

- Show how the board orientation, piece rendering, move list, clocks, last-move marker, and responsive layout changed.
- Include before-and-after screenshots only when they are safe to publish.
- Evidence: relevant AI session records and browser checks.

### Release readiness — Verifying rather than assuming

- Explain CI, static checks, PostgreSQL integration tests, browser accessibility checks, release-build verification, capacity evidence, and recovery drills.
- Clearly separate completed controls from remaining deployment work.
- Evidence: release-readiness evidence index, capacity report, recovery drill reports, and GitHub Actions runs.

### What AI contributed and what the human owned

- Human ownership: product priorities, scope, approval of material decisions, and acceptance of visible behavior.
- AI contribution: structured questioning, implementation, test design, documentation drafts, investigation, and traceability.
- Include concrete examples of rejected or corrected AI proposals where applicable.

## Reusable post template

1. Context and intended outcome.
2. Decision or problem statement.
3. Options considered, including rejected options.
4. Chosen approach and human approval.
5. Implementation summary.
6. Verification evidence and remaining limitations.
7. Links to commits, documents, tests, and screenshots.
8. What changed in the plan after the work.

## Publication checklist

- Confirm every linked commit and document is public.
- Redact secrets and environment-specific recovery information.
- State the date, milestone, and validation status accurately.
- Mark inferred conclusions as inference.
- Keep limitations visible; do not represent a local validation as a production deployment.
