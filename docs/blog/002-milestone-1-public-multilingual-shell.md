# Milestone 1: Before the Game, Make the Door Worth Opening

After Milestone 0, Chess AI could start reliably. It still did not feel like a product. There was no public doorway, no visual identity, no language choice, and no reassuring response when something failed.

Milestone 1 changed that. Before asking two people to trust the platform with a chess game, we asked a simpler question: **does the first page work for a real person, on a real device, in a language they understand?**

## Design Is a Product Decision

Yasmany did not present himself as a graphic designer. Instead of pretending that visual design was an afterthought, he asked AI to help turn product intent into a design direction.

The early discussion compared educational, competitive-modern, and classical chess aesthetics. The useful decision was not to crown one permanent style. It was to make the product themeable from the beginning: application themes would remain separate from board themes, one accessible default would ship first, and future users could select alternatives without forcing a visual rewrite.

That is a small architectural decision with a human benefit. A theme system is not only decoration; it gives the product room to grow while keeping the first experience coherent.

## Three Languages, Not a Future Checkbox

English, Spanish, and French were not added as an afterthought. The shell was built to serve all three from the beginning. The language selector remembers an explicit choice in the browser, and public copy—headings, dialogs, errors, and controls—changes consistently.

The detail that made this credible was progressive enhancement. With JavaScript available, switching language feels immediate. Without it, the selector exposes an Apply action and navigates to a localized server-rendered page. The project refused to treat “JavaScript happened to load” as an accessibility requirement.

## A Phone Found the Gap

The project was tested from devices on the local network, not only from a desktop browser. That mattered.

Mobile Safari exposed an uncomfortable flaw: client-only rendering could leave the first screen unstyled and incomplete while development modules loaded. Server rendering fixed the visible failure—but the first fix was incomplete. The language control and entry buttons still depended on client-side events. A physical-phone test found that gap too.

The final shell has server-navigation fallbacks for those controls, and the automated suite includes a JavaScript-disabled browser check. This is exactly the kind of lesson public development should preserve: the first successful desktop interaction was not enough.

## Failure Should Be Safe and Useful

Milestone 1 also established how the application fails. Unknown routes render a localized error boundary with a safe reference code and a route back home, not a stack trace. When the API is unavailable, the phone experience shows a safe notice and recovers when the service returns.

Behind the screen, the server writes structured Pino completion logs with correlation IDs, route templates, statuses, and durations. The health endpoint returns the matching request identifier. These details do not make a flashy screenshot, but they make later debugging humane.

## What Was Proven

The exit review confirmed all three locales, persisted locale choice, responsive behavior, safe error handling, and the public contract boundary. Playwright and Axe found zero accessibility violations in the Spanish create-game flow. Browser tests verified route behavior, dialog behavior, selector state, and locale persistence. The production browser build did not expose internal API hosts, database configuration, Socket.IO, or chess-rule internals.

## What Was Deliberately Missing

The “create” and “browse” controls opened an approved visual name dialog, but they did not yet create identities or games. The shell was a promise of a player flow, not a fake implementation of one.

## The Lesson

An application shell is where technical architecture meets the first human impression. It taught Chess AI to treat language, loading behavior, failure, and mobile devices as part of the product—not cleanup work after the real features arrive.

The next milestone would finally let a visitor claim a temporary identity and enter the public lobby.

## Source Record

- [Design foundations](../ai/sessions/011-design-foundations.md)
- [Locale persistence](../ai/sessions/012-locale-persistence.md)
- [Milestone 1 exit validation](../ai/sessions/016-milestone-1-exit-validation.md)
