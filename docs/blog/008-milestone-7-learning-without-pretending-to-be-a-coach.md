# Milestone 7: Learning Without Pretending to Be a Coach

Chess AI was always meant to be more than a place where two people could meet and play. The project charter left room for a future educational platform: exercises, courses, coaches, and students. Once multiplayer, durable games, and replay existed, it was tempting to jump straight to the phrase every chess product wants to use: _AI coach_.

We did not.

Instead, Milestone 7 asked a more useful question: what is the smallest learning experience we can make genuinely trustworthy?

The answer was deliberately modest. Show a position. Ask the learner for one move. Let the server decide whether the attempt is accepted. Give a useful response. Let the learner try again.

That sounds almost too small to be interesting. In practice, it forced us to decide what kind of educational product we wanted to build.

## Six positions, not an imaginary curriculum

The first catalog contains six public exercises: two mate-in-one positions, two material-winning positions, and two best-move positions. Each has one accepted move, a prompt, a hint, and an explanation in English, Spanish, and French.

There is no authoring dashboard. No database editor. No account. No “generate a puzzle” button.

That was not a shortcut disguised as a feature. It was a product decision. At this stage, every exercise is version-controlled editorial content. A pull request can show exactly which position, explanation, and accepted move are being published. We can review the lesson rather than merely reviewing a record inserted into a database.

For a public project built in the open, that kind of visibility matters. A chess exercise is not just data. It is a claim: _this move is worth learning, and this explanation helps explain why._

## A puzzle still needs an authority

The browser can draw the board, accept taps, and make the lesson feel immediate. It cannot be the judge of whether the learner succeeded.

When someone submits a move, the browser sends the exercise identifier and a normalized move to the server. The server loads the exercise definition, validates the move through the same chess-rules boundary used by multiplayer play, and only then compares it with the server-owned solution.

This reuses a principle that had already shaped the game itself: the client proposes; the server decides.

The distinction matters even in a solo exercise. A modified browser should not be able to mark a puzzle complete by declaring its own answer correct. More importantly, keeping the rule in one trusted place lets the learning interaction inherit the same legality checks as a real game.

The response is intentionally restrained. A legal but incorrect move gets a short, localized hint and returns the learner to the original position. A correct move receives a concise editorial explanation and an invitation to continue. We do not immediately reveal the answer after a mistake. The goal is to preserve the small but important act of thinking again.

## Orientation is part of the lesson

One early detail looked like presentation, but was really instructional design. Every exercise is oriented from the solver’s side: if Black is to move, Black’s pieces are at the bottom and the board coordinates follow that orientation.

That means the board does not ask a learner to mentally rotate the lesson before solving it. It also keeps the coordinate labels honest. Small choices like this are easy to postpone until they become inconsistencies across a product.

Progress follows the same intentionally limited philosophy. Completion is stored only in the current browser’s local storage. The catalog can show what has been completed, and a reset action asks for confirmation before it removes that local record. No account is silently created; no learning history is sent somewhere else.

It is useful now, private by default, and explicit about its limits.

## The correction was not in chess—it was in our assumption

The milestone gave us a small reminder about test evidence. An early server test assumed that a queen move, `Qf8`, was illegal. The chess rules adapter correctly said otherwise. The production code was not wrong; our test premise was.

We corrected the test to use a move that actually puts the king into attack. This is exactly the kind of AI-assisted development correction worth keeping in the public record: the test looked confident, but confidence is not evidence.

There was a second correction at the browser boundary. A language selected in the URL could disagree with a language already persisted by the client. During hydration, that mismatch could make an interactive study route unstable. The fix ensured that the URL-selected language is applied before the client attaches. Internationalization was not a label-selection problem; it was part of whether the interaction worked.

## What we refused to claim

There is no Stockfish integration. There is no remote engine. There is no real-time generated explanation. There is no claim that a model is providing authoritative coaching.

There are also no variations, multi-move lines, adaptive curricula, paid content, or synchronized learner profiles. Those are plausible futures, not features we had earned the right to describe as finished.

The point of this milestone was not to simulate an entire chess school. It was to establish a clean, reviewable path from a chess position to an authoritative learning response.

By the end, the project had six translated exercises, a public catalog, solver-oriented boards, local-only progress, server validation, and browser tests covering retry feedback, accepted solutions, persistence, and reset. That is not an AI coach. It is something more useful at this stage: a small learning system that makes only the promises it can keep.

## Sources

- [Milestone 7 educational foundations plan](../plan/milestone-7-educational-foundations-plan.md)
- [Session 044: educational foundations planning](../ai/sessions/044-milestone-7-educational-foundations-planning.md)
