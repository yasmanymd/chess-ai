# Human–AI Working Agreement

## Document Control

| Field      | Value                             |
| ---------- | --------------------------------- |
| Status     | Accepted                          |
| Version    | 1.0                               |
| Owner      | Yasmany                           |
| Drafted by | Codex                             |
| Approval   | Accepted by Yasmany on 2026-08-16 |

## Established Rules

The following rules have already been established through the project inception interview:

1. Working conversations may be conducted in Spanish.
2. Project documentation must be written in English.
3. AI will interview the project owner before preparing artifacts that require product, architectural, or process decisions.
4. AI may make clearly labeled recommendations but must not silently resolve significant decisions.
5. Yasmany is the final decision authority.
6. AI will perform implementation work, subject to human approval and evidence-based verification.
7. Structured session summaries are preferred over complete transcripts.
8. Important prompts and responses may be preserved verbatim when they provide educational or audit value.
9. Models, tools, and agents should be identified when that information is available.
10. Relevant rejected proposals, AI errors, failed experiments, and superseded decisions will be documented.
11. Every meaningful code change should be traceable to its session, task, applicable decision, and verification evidence.
12. Secrets and unintended personal information must not be published.

## Proposed Delivery Loop

1. Establish context and desired outcome.
2. Interview the human decision owner where judgment is required.
3. Record assumptions and open questions.
4. Generate alternatives and a recommendation.
5. Obtain human approval for significant decisions.
6. Implement the smallest coherent increment.
7. Verify the result with evidence proportional to risk.
8. Review limitations and unexpected outcomes.
9. Update documentation, traceability, and the session record.
10. Obtain human acceptance when a milestone or decision requires it.

## Decision Authority and Delegation

Yasmany is the default decision authority. When a decision is required, AI must initially present the decision for human approval rather than assuming authority.

When requesting approval, AI should:

1. State the decision that is required.
2. Explain the relevant context and impact.
3. Present reasonable alternatives when they exist.
4. Provide a recommendation and its rationale.
5. Identify the category and intended scope of the decision.
6. Ask whether the approval applies only to the current case or may be reused for materially similar future decisions.

Yasmany may explicitly delegate a defined category of similar decisions to AI. A delegation must record:

- The decision category.
- Its scope and boundaries.
- Any constraints or preferred criteria.
- The session in which it was granted.
- Whether notification is still required after AI acts.

Delegation is never inferred from silence or from approval of a single case. It does not extend to materially different decisions. AI must ask again when a decision falls outside the recorded scope, has substantially greater impact or risk, conflicts with another decision, or introduces a new irreversible consequence.

Yasmany may modify or revoke a delegation at any time. Until a delegation is explicitly granted, the default behavior is to ask.

Whenever AI acts under delegated authority, it must inform Yasmany. The notification should identify the action, the delegation used, and any relevant consequence. Routine actions may be summarized concisely, but they must not be hidden solely because authority had already been delegated.

## Decisions Requiring Human Approval

High-impact decisions always require explicit approval from Yasmany. Related prior approvals or delegations do not automatically authorize them.

This category includes:

- Changing product scope or fundamental product direction.
- Adopting or replacing a primary technology.
- Changing the overall system architecture.
- Creating material or recurring costs.
- Deploying to production.
- Handling real credentials, secrets, or user data.
- Performing destructive or difficult-to-reverse operations.
- Accepting significant security, privacy, operational, or data-loss risk.
- Selecting or changing software licenses or other material legal terms.

AI must also request approval for an unlisted decision when its impact is reasonably comparable to the examples above.

## Decision Delegation Register

No reusable decision authority has been delegated yet.

| ID  | Category | Scope | Constraints | Granted in | Notification | Status |
| --- | -------- | ----- | ----------- | ---------- | ------------ | ------ |
| —   | —        | —     | —           | —          | —            | None   |

## Implementation Autonomy

After Yasmany approves a task, AI may autonomously perform small technical adjustments required to complete it, including:

- Internal naming choices.
- Local code organization.
- Minor defect corrections discovered within the task.
- Limited refactoring necessary for correctness or maintainability.
- Formatting and static-analysis corrections.
- Documentation updates directly related to the change.

This autonomy does not permit AI to change product scope, system architecture, public contracts, primary technologies, or other high-impact decisions. If a discovered issue requires a material expansion of the task, AI must request approval.

## Required Quality Controls

Every implementation task must include controls appropriate to its nature and risk:

1. Relevant automated tests.
2. Formatting and static analysis.
3. Review of the resulting change.
4. Documentation updates when behavior, interfaces, decisions, or operations change.
5. Verifiable evidence that the acceptance criteria are satisfied.
6. Disclosure of known limitations, unresolved risks, and unverified behavior.

The specific depth of each control may vary by risk, but omission must be justified and visible.

## Multi-Agent Work

AI may use specialized agents for research, implementation, testing, review, security analysis, documentation, or other bounded work.

Multi-agent work must preserve:

- One coordinating authority responsible for the final integrated result.
- Attribution of significant agent contributions when the information is available.
- Clear task boundaries.
- Independent verification where useful.
- Human approval requirements defined by this agreement.

Delegating work to another agent does not delegate Yasmany's decision authority and does not reduce the verification standard.

## Completion and Verification

An implementation task cannot be marked complete when its acceptance criteria have not been adequately verified.

If complete verification is not possible, AI must:

1. State what was verified.
2. State what remains unverified and why.
3. Describe the resulting risk or uncertainty.
4. Identify the action required to complete verification.
5. Leave the task open or explicitly blocked rather than presenting it as complete.

## Source Control and Change Review

The project will apply the following source-control practices:

1. Each implementation increment will be associated with a tracked task and developed on a dedicated branch rather than directly on the main branch.
2. Commits will represent coherent units of work and use messages that communicate purpose. A commit is not required for every AI interaction.
3. Every significant change will use a documented pull request containing the objective, implemented solution, related decisions, tests, evidence, risks or limitations, AI and agent participation, and visual evidence when applicable.
4. AI will perform a technical review of the complete change before integration. Yasmany retains final approval for significant integrations and milestone completion.
5. Session records, experiments, and evaluations will preserve relevant failures and learning. Git history does not need to preserve every broken intermediate attempt when doing so adds no durable value.
6. When the public repository is created, the main branch will be protected by appropriate required checks.

## Risk Classification

Every implementation task will receive an initial risk classification proposed by AI and recorded with the task. When classification is uncertain between two levels, the higher level will apply.

### Low Risk

Examples include documentation, formatting, text changes, and trivial internal changes.

- Review: AI review.
- Verification: Basic checks appropriate to the artifact.
- Approval: May proceed under approved implementation autonomy.

### Medium Risk

Examples include ordinary features, user-interface components, non-sensitive endpoints, and routine data access.

- Review: Complete AI review of the change.
- Verification: Unit and integration tests as applicable.
- Approval: Inform Yasmany according to the working agreement and any applicable delegation.

### High Risk

Examples include authentication, security controls, critical persistence, chess rules, concurrency, real-time synchronization, database migrations, clocks, and game recovery.

- Review: Additional independent or specialized review.
- Verification: Broad positive, negative, boundary, and integration coverage as applicable.
- Approval: Explicit approval from Yasmany.

### Critical Risk

Examples include production operations, credentials, real user data, destructive actions, payments, and legal or licensing changes.

- Review: Specialized review and an explicit rollback or recovery plan.
- Verification: Exhaustive verification in a safe environment proportional to the action.
- Approval: Explicit approval from Yasmany before execution.

## Definition of Done for a Task

A task is Done only when:

1. Its acceptance criteria are satisfied.
2. Implementation is complete within the approved scope.
3. Tests required by its risk level pass.
4. Formatting, static analysis, and build checks pass.
5. The change has received the review required by its risk level.
6. Affected documentation is updated.
7. Verifiable evidence demonstrates the result.
8. Known limitations and residual risks are documented.
9. Traceability to the task, session, and applicable decisions is complete.
10. No known defect contradicts the acceptance criteria.
11. Yasmany has approved the result when required by risk level or milestone governance.

## Definition of Done for a Milestone

A milestone is Done only when:

1. All mandatory milestone tasks satisfy the task-level Definition of Done.
2. The integrated outcome has been demonstrated.
3. Applicable end-to-end tests pass.
4. Security, accessibility, and internationalization have been reviewed.
5. Architecture, risks, and project-status documentation are current.
6. Yasmany has formally accepted the milestone.

## Attribution

Each session will identify, when the information is available:

- Human participants.
- AI model.
- Coordinating agent.
- Specialized subagents.
- Relevant tools.
- Artifacts and code produced.

The project will not falsely attribute work to a specific model, tool, or agent. When attribution metadata is unavailable, the record will use `Unknown` or `Not exposed`.

## Uncertainty and Disagreement

When AI has low confidence or multiple reasonable alternatives remain, it must disclose the uncertainty, present available evidence, and request Yasmany's decision when the choice is significant.

When agents provide contradictory recommendations, the coordinating agent must:

1. Explain the disagreement.
2. Compare the evidence, trade-offs, and consequences.
3. Provide a reasoned recommendation.
4. Request Yasmany's decision when required by significance, risk, or this agreement.

Significant claims about security, licensing, compatibility, or technical behavior must be supported by authoritative sources, direct inspection, or experiments rather than AI memory alone.

Relevant AI errors will be documented. Trivial wording, spelling, or formatting corrections do not need to become historical incidents unless they materially affect meaning or outcomes.

## Final Approval

Yasmany reviewed and accepted this agreement on 2026-08-16. Any later material amendment must record its rationale and human approval.

## Revision History

| Version | Date       | Change                                                            | Decision owner |
| ------- | ---------- | ----------------------------------------------------------------- | -------------- |
| 0.1     | 2026-08-16 | Initial rules collected from the project inception interview.     | Yasmany        |
| 0.9     | 2026-08-16 | Full agreement proposed after the dedicated governance interview. | Yasmany        |
| 1.0     | 2026-08-16 | Complete agreement reviewed and accepted.                         | Yasmany        |
