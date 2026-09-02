# Why Build Chess AI in Public with AI Assistance?

Most software projects start with a feature request. Chess AI started with a more uncomfortable question: **what really happens when a human builds serious software with AI at their side?**

It is easy to show a polished prompt, a generated screen, and a final demo. It is much harder—and more useful—to show the decisions, wrong assumptions, broken tests, revisions, and human judgment in between. That is the experiment behind Chess AI.

## The Product Is Real. So Is the Record.

Chess AI is a multiplayer web platform in the making: people can play, revisit games, and eventually learn through guided chess material. The first version begins deliberately small. Two people can meet online without accounts, play a server-validated game, and use the first educational exercises.

The application is only half of the project. The other half is a public development journal. Every major milestone has a plan, approved decisions, implementation evidence, and a record of what changed when reality disagreed with the first proposal.

This is not an attempt to prove that AI replaces engineers. It is an attempt to make assisted engineering inspectable.

## Who Decides?

Yasmany is the decision owner. AI helps research options, explain trade-offs, produce drafts, implement approved work, and test assumptions. It does not quietly decide what the product should become.

That distinction matters when a quick technical choice becomes a long-term commitment. Significant decisions—such as making the server authoritative for chess moves, publishing the process openly, or deferring user accounts—are discussed and explicitly approved. Repeated, low-risk choices can be delegated once their governing rule is clear.

The result is neither “AI builds everything alone” nor “AI is only autocomplete.” It is a collaboration model with visible accountability.

## Why Chess Is an Honest Test

Chess looks simple from a distance. In software, it quickly becomes a systems problem: browser interaction, realtime updates, concurrent commands, authoritative state, persistence, recovery, accessibility, localization, and a usable learning experience.

It also poses a question that attractive UI cannot answer: who decides whether a move is legal? Chess AI answers that the server is the authority. The browser proposes a move; the server validates it, persists it, and publishes the resulting state. That boundary supports fair play now and trustworthy replay, recovery, and exercises later.

## We Will Publish the Friction Too

An AI suggestion can be plausible and still wrong. During the first setup, an AI-proposed package version did not exist. A database migration made assumptions TypeScript did not catch. A container arrangement created unwanted dependency folders on the host machine. Each problem became a correction, a test, and a lesson.

Those details belong in the story. A process that only reports successful generations teaches very little. This journal will include rejected approaches, unexpected browser and phone behavior, CI failures, and the evidence used to resolve them.

## How to Read the Series

The articles follow milestones rather than diary dates. Each article asks the same questions: What outcome were we trying to achieve? Which decisions were human decisions? What did AI help with? What went wrong? What evidence showed the work was actually done? And what did we deliberately leave for later?

The promise is modest: not a frictionless automation story, but a practical record of how careful humans can use AI to build software that deserves to be trusted.

## Next

The first milestone began before a single chess piece appeared on screen. It began with a less glamorous question: could someone clone the project and start working without reconstructing the environment by hand?
