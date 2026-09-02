# Chess AI Development Journal

## Purpose

This directory is the editorial source for a future public article series about building Chess AI with AI assistance. It is distinct from the engineering documentation: planning documents record decisions as they are made, while these articles explain the work as a coherent, evidence-based story for readers.

The series will be published after the first public version is complete. Writing starts now so that each milestone can be captured while its context, trade-offs, and evidence are still available.

## Editorial Principles

- Write in English for an international public audience.
- Describe both successful work and corrections, including incorrect AI assumptions when they materially affected the work.
- Attribute decisions to the human decision owner and implementation or analysis support to AI where relevant.
- Link claims to versioned plans, session records, tests, commits, or other evidence in this repository.
- Prefer practical lessons and concrete technical detail over promotional claims.
- Do not expose secrets, private information, or raw conversation transcripts unless explicitly selected for publication.

## Planned Series

| Order | Working title                                          | Primary source material                      | Publication status |
| ----- | ------------------------------------------------------ | -------------------------------------------- | ------------------ |
| 000   | Why Build Chess AI in Public with AI Assistance?       | Project charter and early decision records   | Draft started      |
| 001   | Milestone 0: A Reproducible Starting Point             | Milestone 0 plan and implementation evidence | Draft started      |
| 002   | Milestone 1: A Public, Multilingual Application Shell  | Milestone 1 plan and implementation evidence | Draft started      |
| 003   | Milestone 2: Temporary Identity and a Public Lobby     | Milestone 2 plan and implementation evidence | Draft started      |
| 004   | Milestone 3: Making the Server the Chess Authority     | Milestone 3 plan and implementation evidence | Draft started      |
| 005   | Milestone 4: Durable Games, Recovery, and Concurrency  | Milestone 4 plan and implementation evidence | Draft started      |
| 006   | Milestone 5: Archive, PGN, and Replay                  | Milestone 5 plan and implementation evidence | Draft started      |
| 007   | Milestone 6: Release Readiness and Evidence            | Milestone 6 plan and implementation evidence | Draft started      |
| 008   | Milestone 7: Learning Without Pretending to Be a Coach | Milestone 7 plan and session evidence        | Draft started      |
| 009   | What We Learned Building the First Version             | All milestones and retrospective notes       | Pending            |

## Article Template

Each milestone article should include:

1. The outcome promised at the start of the milestone.
2. Decisions made by the human decision owner and why they mattered.
3. Architecture and implementation choices.
4. Evidence: tests, demonstrations, screenshots, and relevant commits.
5. Setbacks, corrections, and rejected alternatives.
6. What the milestone deliberately deferred.
7. The lesson that informed the next milestone.

## Source of Truth

The articles are secondary editorial artifacts. The authoritative engineering record remains in `docs/plan/` and `docs/ai/sessions/`.

## Draft Languages

The English files in this directory are the editorial source drafts. Spanish and French versions are kept in `es/` and `fr/` while the series is being reviewed. Publication can later use a multilingual site, separate language feeds, or only the languages selected by Yasmany.
