---
name: writing-anuragbuildsthings-posts
description: Use when starting a new blog post for anuragbuildsthings.com, deciding between a narrative companion post or a living document, or matching the site's established Quarto post conventions and voice.
---

# Writing anuragbuildsthings.com Posts

## Overview

The site is a Quarto site at `~/anurag-builds-things/anuragbuildsthings-site/`. Posts live in `posts/*.qmd` and the home listing in `index.qmd` picks them up automatically.

Posts fall into **two distinct patterns** with different structure, frontmatter, custom CSS use, and Substack handling. Decide which pattern applies before writing — the structure templates aren't interchangeable.

## When to use

- Starting a new post
- Reviewing whether a draft matches site voice and conventions
- Deciding whether content should be a frozen narrative or an ongoing reference
- Deciding whether to mirror a post to Substack

## Pick the pattern first

| Pattern | When | Substack? | Example |
|---|---|---|---|
| **Narrative companion** | Frozen artifact paired with a video, talk, or external piece. Written once. Argument has a beginning, middle, end. | Yes, mirror after publish | `posts/claude-code-agent-teams-real-work.qmd` |
| **Living document** | Ongoing reference that grows over time. Has a "last updated" date in the body. Entries added incrementally. | **Not until milestone** (~10 entries → roundup post) | `posts/prompts-i-keep-coming-back-to.qmd` |

Most posts are narrative. Living docs are explicit, ongoing references.

## Frontmatter

```yaml
---
title: "Title Case With Plain Voice"
date: YYYY-MM-DD
categories: [kebab-case, hyphenated, lowercase]
description: "1-2 sentences. Concrete. Names the actual thing (Scality, S3 CSI driver), not a generic version. Used as OG description and home-listing blurb."
image: figures/{slug}-thumb.{png|jpg}
image-alt: "Brief description for screen readers."
---
```

Categories used on the site so far: `claude-code`, `agent-teams`, `ai-coding`, `kubernetes`, `csi`, `prompts`, `living-document`. Reuse where applicable; add new ones sparingly. Living docs always include `living-document`.

## Narrative companion: structure

1. `::: {.callout-note}` — one-sentence context line. Once Substack is published, add "Also on [Substack](url)" inline.
2. Embedded YouTube via HTML iframe block (16:9 responsive). Use `{=html}` raw block; see example post.
3. `## What this is` — 2-3 paragraphs setting context. Name real entities by name (companies, public repos). Don't sanitize when the work is already public.
4. **Pull-quotes from the source** with timestamp links — `> "quote" [▶ MM:SS](https://www.youtube.com/watch?v={ID}&t={SECs})`. Use the `▶` prefix; readers learn it as "this is a clickable video timestamp."
5. 2-3 main content sections. Common shapes: "What I actually did", "Three settings worth knowing", "What the cost actually looked like".
6. `## What I'd do differently next time` — bulleted lessons.
7. `## Bottom line` — short closing. End with a memorable kicker, not a summary.
8. `## Links` — every external reference collected here.

## Living document: structure

1. `::: {.callout-note}` with `**Living document — last updated YYYY-MM-DD.**` Hand-edit on each update.
2. `## What this is` — explicitly frame as collected/curated, not invented. Be honest about the "I kept losing them" motivation.
3. `## Quick reference` — table linking to every entry's anchor. Grows with the doc.
4. `## {Section name}` with `### Entry heading {.entry}` per entry. Uses the `h3.entry` CSS counter (auto-numbered prefix `01`, `02`, …, resets per H2). Top rule above each entry marks boundaries.
5. Entry body: explanation prose → `::: {.prompt-card}` containing only the copy-pasteable content → optional `::: {.prompt-note}` for trailing commentary.
6. `## On my radar` — public TODO list of half-remembered/unfinished entries.
7. `## How I add to this` — methodology footer (the bar an entry must clear).

Custom CSS classes available in `styles.css`:
- `.prompt-card` — elevated container with left rail, generous typography for prompts
- `.prompt-source` — italic em-dash-prefixed source line
- `.prompt-note` — body-prose commentary slot below the card
- `h3.entry` — auto-numbered heading with top rule (counter resets per H2)

## Voice and editorial choices

- **Plain, concrete, anti-cliché.** "Not vibe coding, intentional AI coding." Direct.
- **Anchor in real artifacts** — repo URLs, dollar amounts, viewport widths, exact commit counts. Vague claims weaken the post.
- **Hard truths over comfortable framings.** Acknowledge cost, tradeoffs, what didn't work, what you'd do differently.
- **Don't pad.** A 1-line answer is a 1-line section. Length matches the reasoning, not the diff.
- **Kicker matters.** End on the load-bearing sentence, not a summary line.

## Code blocks

- Use **unlabeled fences** (` ``` `) when there's no need for syntax highlighting. Quarto's `github-dark` highlight theme has had contrast issues on the site's dark `--paper-up` background; `styles.css` includes a fix that forces `--ink` color, but unlabeled is the safe default.
- Use **labeled fences** (` ```json `, ` ```yaml `) only when the syntax highlighting genuinely helps the reader.
- Inline backticks render `--signal` lime accent on `--paper-up` background — use for filenames, flags, short code references.

## Thumbnail

- **16:9** aspect ratio, **1920×1080** or **1280×720**, saved as `posts/figures/{slug}-thumb.{png|jpg}`.
- **Palette:** near-black `#0c0d0b` background, lime `#c8e25c` accent, ivory `#ecece4` typography.
- For video-paired posts: download the YouTube thumbnail with `curl -o posts/figures/{slug}-thumb.jpg "https://img.youtube.com/vi/{ID}/maxresdefault.jpg"`.
- For other posts: generate a custom image. Avoid AI/robot/generic-code clichés. Aim for **evocative metaphor** (apothecary shelf, typesetter's drawer, tarot spread, etc.) — collection-of-objects motifs work especially well.
- Thumbnails must remain readable at home-listing size (~280 px wide). Avoid layouts that put all content in one corner — that leaves "empty halves" at small sizes.

## Should this post go to Substack?

| Pattern | Mirror? |
|---|---|
| Narrative companion | **Yes** — after the site post is live and merged. **REQUIRED SUB-SKILL: Use writing-anuragbuildsthings-substack-mirror** |
| Living document (sparse) | **No** — wait for milestone (~10 entries), then publish a discrete roundup post |

## Workflow

1. **Branch** off main: `posts/{slug}` or `chore/{topic}` (for non-post changes).
2. **Create** `posts/{slug}.qmd` using the pattern's structure template.
3. **Run** `quarto preview` (auto-starts a watcher; pick up the localhost URL from its output). Iterate visually — the site has opinions about typography, spacing, and dark-mode contrast that only show up in the rendered output.
4. **Drafts** for image-generation prompts, Substack mirrors, LinkedIn posts go in `post-temp-data/` (already gitignored).
5. **Commit** with a short, specific message: `post: {what changed}`.
6. **PR description** uses the five-section format the user established globally — `## Intent: why does this change exist?`, `## System impact: ...`, `## Preserved behavior: ...`, `## Intended change: ...`, `## Verification: ...`. Brief: 1-3 sentences per section.
7. **After merge:** for narrative posts, invoke `writing-anuragbuildsthings-substack-mirror`. For living docs, skip until milestone.

## Common mistakes

- **Generic title or description.** "On Claude Code" is generic. "Claude Code Agent Teams on a Real Production Chore" is specific. The title is the listing-card hook.
- **Skipping the callout-note opener.** The framing line tells the reader what they're reading and why.
- **Putting Substack draft in the qmd file.** Substack drafts live in `post-temp-data/{slug}-substack.md` (gitignored).
- **Forgetting the thumbnail.** Without `image:` in frontmatter, the home listing has no visual.
- **Mirroring a sparse living doc to Substack on first publish.** Wait for milestone — subscribers shouldn't be emailed the smallest version of a doc that's going to grow.
- **Language-tagged code fences when not needed.** Unlabeled is safer; only label when syntax highlighting genuinely helps.
- **PR commits to a stale branch after merge.** If you push to `posts/{slug}` after that PR merged, the new commits go nowhere useful. Check out a fresh branch off main for any follow-ups.

## Examples

Read these before writing — both are merged and live:

- **Narrative companion:** `posts/claude-code-agent-teams-real-work.qmd`
- **Living document:** `posts/prompts-i-keep-coming-back-to.qmd`

The custom CSS for living docs lives in `styles.css` under "Prompt cards (favorite-prompts post)".
