# AI Tools Timeline Post — Design

**Date:** 2026-05-22
**Branch:** `posts/ai-tools-timeline`
**Slug:** `ai-tools-timeline`

## Intent

A new post on anuragbuildsthings.com that presents, as a styled vertical timeline, the AI coding tools the author has actually leaned on day-to-day. Living document — entries get added over time as new tools are adopted.

## Pattern

Living document (per the site's `writing-anuragbuildsthings-posts` skill), with one deliberate deviation: no `## Quick reference` table, because the timeline itself is the quick reference. All other living-doc conventions hold (callout-note opener with "last updated" date, `## What this is`, `## On my radar`, `## How I add to this`).

## Files touched

- **New:** `posts/ai-tools-timeline.qmd`
- **Modified:** `styles.css` — add a new section `/* Timeline (ai-tools-timeline post) */` with the component CSS.
- **New (later, not in v1 PR scaffolding):** `posts/figures/ai-tools-timeline-thumb.png` — 16:9, dark/lime/ivory palette, abstract timeline-with-dots motif. Generated after structure is in place.

No JS changes. No `_quarto.yml` changes.

## Frontmatter

```yaml
---
title: "My AI-Assisted Coding Tools, October 2024 →"
date: 2026-05-22
categories: [ai-coding, living-document, timeline]
description: "A running vertical timeline of the AI tools I've leaned on day-to-day for coding, from October 2024 onward. Updated as I adopt new ones."
image: figures/ai-tools-timeline-thumb.png
image-alt: "Vertical timeline of dated tool cards on a dark background."
---
```

New category introduced: `timeline`. Title is a working title; can be edited inline before merge.

## Page structure

1. `::: {.callout-note}` — `**Living document — last updated 2026-05-22.**`
2. `## What this is` — 2-3 paragraphs. Scope: "tools I actually leaned on for coding, not every chatbot I tried." Honest about the start date (October 2024) being when AI-assisted coding became a real part of the author's workflow.
3. `## Timeline` — the component.
4. `## On my radar` — short bulleted list of tools being evaluated.
5. `## How I add to this` — methodology footer: the bar an entry must clear (sustained daily use, not a one-week trial).

## Timeline component

Authored as nested Quarto fenced divs — no raw HTML in the post body. The wrapping `.timeline` div contains a series of `.timeline-entry` divs. Each entry has:

- A date heading: `### {Month Year} {.timeline-date}` — e.g. `### October 2024 {.timeline-date}`.
- A `.timeline-tools` container holding one or two `.tool-card` divs.
- Each `.tool-card` has a bold tool name on the first line and an em-dash subtitle on the second line.

Example shape:

```
::: {.timeline}

::: {.timeline-entry}
### October 2024 {.timeline-date}
::: {.timeline-tools}
::: {.tool-card}
**ChatGPT**
— assisted coding and systems thinking
:::
:::
:::

::: {.timeline-entry}
### January 2025 {.timeline-date}
::: {.timeline-tools}
::: {.tool-card}
**Cursor**
— in-editor agentic coding
:::
:::
:::

::: {.timeline-entry}
### April 2025 {.timeline-date}
::: {.timeline-tools}
::: {.tool-card}
**Claude Code**
— agentic CLI for real work
:::
:::
:::

:::
```

Cursor and Claude Code subtitles are placeholders ("in-editor agentic coding", "agentic CLI for real work") for the author to edit inline.

## v1 content

Three confirmed entries:

| Date | Tool | Subtitle |
|---|---|---|
| October 2024 | ChatGPT | assisted coding and systems thinking |
| January 2025 | Cursor | *placeholder — author edits* |
| April 2025 | Claude Code | *placeholder — author edits* |

## CSS additions (new section in `styles.css`)

Added under a new top-level comment block: `/* Timeline (ai-tools-timeline post) */`. Component breakdown:

- `.timeline` — block container, `position: relative`, vertical padding.
- `.timeline::before` — a `1px` vertical rule (`background: var(--rule)`) on the left rail, spanning the container's height.
- `.timeline-entry` — `display: grid; grid-template-columns: 10rem 1fr; gap: 1.5rem;` plus vertical spacing between entries. Has a `::before` lime dot (`#c8e25c`, ~10px circle) absolutely positioned on the rail, vertically aligned with the date heading's baseline.
- `.timeline-date` (an H3) — small, uppercase, letter-spaced, `color: var(--ink-dim)`, no top rule, **no counter** — explicitly overrides the `h3.entry` counter from the prompts post so it doesn't get auto-numbered.
- `.timeline-tools` — `display: flex; flex-wrap: wrap; gap: 1rem;` so two tool cards sit side-by-side on desktop and wrap on narrow widths.
- `.tool-card` — `background: var(--paper-up)`, left lime rail (`border-left: 3px solid #c8e25c`), `padding: 0.75rem 1rem`, `min-width: 14rem`, `flex: 1 1 0`. First line bold for the tool name; second line `color: var(--ink-dim)` for the em-dash subtitle.
- **Mobile (`@media (max-width: 700px)`):** `.timeline-entry` collapses to a single column; the date heading sits above the cards; the rail and dot shift to `left: 12px`.

## What this design explicitly preserves

- Dark-only theme — no light-mode work.
- Existing `h3.entry` counter behavior on the prompts post — unchanged. The new `.timeline-date` rule scopes only to H3s inside `.timeline-entry`.
- Listing-page behavior — the post appears automatically via the existing `index.qmd` listing block.
- No JS additions. No new external dependencies.

## Verification

- `quarto preview` locally; confirm the timeline renders with the rail, dots, and side-by-side cards (the third entry could have a second card added temporarily to verify two-card layout).
- Resize browser below 700px; confirm collapse to single-column with the rail still visible on the left.
- Visit the home page in preview; confirm the new post shows up in the listing with thumbnail (once thumb is generated) and description.
- Confirm the prompts post (`posts/prompts-i-keep-coming-back-to.qmd`) still renders identically — the `h3.entry` counter must not be broken by the new `.timeline-date` rule.

## Open items deferred to implementation

- Thumbnail generation — happens after structure is verified in preview. Image-gen prompt goes in `post-temp-data/ai-tools-timeline-thumb-prompt.md`.
- Final wording of `## What this is`, `## On my radar`, `## How I add to this` — drafted by Claude during implementation, edited by author inline.

## Out of scope

- Backfilling pre-2024 AI use. Explicitly deferred — the scope is the assisted-coding journey, which starts October 2024.
- Substack mirror. Living docs don't mirror until milestone (~10 entries).
- A "Quick reference" table. The timeline is the quick reference.
