# Initial Visual Design Brief

## Status

Draft for review in Session 011.

## Purpose

Define a coherent and accessible starting point for Chess AI's first web experience. This brief guides the first responsive web shell; it does not lock the product into a permanent theme.

## Product Character

Chess AI should feel calm, capable, and welcoming. It should make a casual player comfortable starting an online game while making the educational purpose visible without competing with the primary action.

## Primary Entry-Screen Goal

Help a first-time or returning player begin an online game quickly.

1. The primary action is to create a game or browse available games.
2. Learning is visible as a secondary, clearly labelled future path.
3. The visible-name prompt appears only after a person chooses to create or join a game.

## Default Theme Direction

The initial default is a **study-focused neutral theme**.

- Light, warm-neutral background for readability and long sessions.
- Dark ink text for calm contrast.
- A restrained deep blue as the interactive accent.
- A subtle green success color for availability and confirmed actions.
- Generous whitespace and clear component boundaries.
- Chess references appear through language, board previews, and small geometric motifs rather than decorative illustrations.

The default is intentionally neutral enough to coexist with future playful, classical, high-contrast, or dark themes.

## Layout Principles

### Desktop

- A compact top bar contains the product mark, language control, and a future theme control.
- The main content has a clear two-column rhythm: product intent and primary actions on the left; an abstract board or activity preview on the right.
- Primary actions remain visible without scrolling on a common laptop screen.

### Mobile

- Content is single-column and action-first.
- Language and future theme controls remain reachable in the top bar.
- Tap targets are at least 44 by 44 CSS pixels.
- The board or activity preview follows the primary actions and never blocks game entry.

## Component Direction

| Component               | Role                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| Product mark            | Establishes Chess AI as a calm learning and play space.                      |
| Primary action card     | Creates a game or opens the game list.                                       |
| Secondary learning card | Signals the educational future without pretending unfinished features exist. |
| Name dialog             | Collects a required unique visible name only at the intent boundary.         |
| Language control        | Switches English, Spanish, and French independently of theme.                |
| Theme control           | Designed as an extensible placeholder until selectable themes ship.          |

## Theme Contract

Components must use semantic tokens. Theme implementations will define values for these token groups:

- Application canvas, surface, border, and elevation.
- Primary, secondary, success, warning, and danger actions.
- Primary and muted text.
- Focus, hover, and disabled states.
- Board light square, board dark square, coordinates, and highlights.

Application tokens and board tokens must remain separate.

## Accessibility Baseline

- Text and interactive controls must meet WCAG AA contrast expectations.
- Focus indicators are always visible when using a keyboard.
- Information is not communicated through color alone.
- The layout accommodates the three supported interface languages without clipping or fixed-width labels.
- Animations must respect reduced-motion preferences.

## Scope Boundary

This brief describes the visual shell only. It does not yet implement authentication, user profiles, the game lobby, a playable board, courses, or theme selection.

## Review Criteria

The first implementation proposal is ready for review when it demonstrates:

1. A responsive entry screen that makes play primary and learning secondary.
2. English, Spanish, and French content through the existing localization setup.
3. Semantic tokens rather than hard-coded theme values in components.
4. An accessible keyboard and focus baseline.
5. A just-in-time name dialog in a non-final, locally simulated form.
