# Documentation Index

This directory is the source of truth for product, architecture, planning, and AI-assisted development records.

## Artifact map

| Area                             | Purpose                                                         | Current state  |
| -------------------------------- | --------------------------------------------------------------- | -------------- |
| [`ai/`](ai/)                     | Human–AI rules, sessions, prompts, experiments, and evaluations | Started        |
| [`product/`](product/)           | Vision, scope, requirements, and product decisions              | Started        |
| [`architecture/`](architecture/) | System context, domain model, quality attributes, and diagrams  | Pending        |
| [`decisions/`](decisions/)       | Architecture Decision Records                                   | Template ready |
| [`design/`](design/)             | Visual system and interaction design briefs                     | Started        |
| [`planning/`](planning/)         | Roadmap, milestones, backlog, risks, and status                 | Pending        |
| [`reference/`](reference/)       | Analysis of predecessor systems and external references         | Started        |
| [`templates/`](templates/)       | Reusable documentation templates                                | Ready          |

## Documentation rules

1. Project documentation is written in English.
2. Every artifact declares its status when it can be mistaken for an accepted decision.
3. Unknown information is marked `Pending` or `TBD`; it is not silently invented.
4. Significant changes include a revision history or are traceable through version control.
5. Decisions, implementation, and verification evidence are cross-referenced when applicable.
6. Secrets and unintended personal information must never be committed.

## Status vocabulary

- **Draft:** under discussion and not yet authoritative.
- **Proposed:** complete enough for an approval decision.
- **Accepted:** approved by the human decision authority.
- **Superseded:** replaced by a later artifact or decision.
- **Rejected:** considered and explicitly not adopted.
