# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal site at [anuragbuildsthings.com](https://anuragbuildsthings.com/), built with [Quarto](https://quarto.org/). Posts live in `posts/*.qmd` and the home page (`index.qmd`) auto-lists them via a `listing:` block.

The custom theme — internally called "Instrument", defined in `styles.css` (SCSS) — is a **dark-only** design. The Quarto light/dark toggle is intentionally overridden via `!important` rules so both themes render the same dark palette. Don't try to add light-mode support without an explicit ask.

## Commands

- `quarto preview` — local dev server with file-watcher and live reload. Port varies; pick the URL out of the command's output.
- `quarto render` — one-shot render to `_site/` for inspection (rarely needed; `preview` watches).
- `git push origin main` — triggers `.github/workflows/publish.yml`, which renders and pushes to the `gh-pages` branch. The custom domain `anuragbuildsthings.com` is wired via `CNAME`.

There is no `package.json`, no test suite, no lint command — this is a static-content repo. JavaScript in `palette.js` and `post-enhance.js` is loaded directly by Quarto via `_quarto.yml`'s `include-after-body`.

## Architecture

**Two post patterns** with different conventions, structure, and Substack handling:

- **Narrative companion** — frozen-in-time prose, usually paired with an external piece (e.g. a YouTube video). Example: `posts/claude-code-agent-teams-real-work.qmd`.
- **Living document** — grows over time, has a "last updated" date in the body, uses custom CSS for numbered entry cards (`.prompt-card`, `h3.entry` with auto-incrementing CSS counter). Example: `posts/prompts-i-keep-coming-back-to.qmd`.

For the full conventions of each pattern (frontmatter, structure templates, voice, code-block rules, thumbnail handling, Substack mirror decision flow), see **`.claude/skills/writing-anuragbuildsthings-posts/SKILL.md`**. That skill is project-scoped and loads automatically.

**Custom CSS** in `styles.css` is opinionated and sizeable. Key parts:
- The full Instrument theme — typography tokens, dark-mode overrides, navbar styling with per-icon brand-color hovers.
- Post-page layout grid that pins TOC left and centres a 1200px article; switches to a fully centred layout above a 1800px viewport so wide-screen post pages align with the home listing's frame.
- `.prompt-card`, `.prompt-source`, `.prompt-note`, `h3.entry` rules used only by the living-document pattern.

**Custom JS:**
- `palette.js` — command-palette overlay with a hardcoded `ACTIONS` array (social links + email). Brand-color hovers per icon mirror the navbar.
- `post-enhance.js` — runtime polish on rendered posts (TOC behavior, anchor enhancements).

## Local-only directories

- `post-temp-data/` (gitignored) — working drafts for Substack mirrors, LinkedIn cross-posts, transcripts, image-generation prompts. Used while authoring a post but never shipped with the site.
- `.planning/` (gitignored) — earlier planning notes; Quarto skips it via the `!.planning/` render exclusion.
- `_site/`, `.quarto/` (gitignored) — render output and Quarto cache.

## PR conventions

PR descriptions on this repo use a five-section format (also reflected in `~/.claude/CLAUDE.md` for the user globally):

- `## Intent: why does this change exist?`
- `## System impact: what's affected, including downstream?`
- `## Preserved behavior: what explicitly stays the same?`
- `## Intended change: what's different after this PR?`
- `## Verification: how do we know this worked, or how would we know if it didn't?`

1-3 sentences per section. Brief, concrete, narrate the thinking — not the diff.

## Branch hygiene

Pattern is **one PR per logical change**, with descriptive branch names: `posts/{slug}`, `chore/{topic}`, `fix/{issue}`. After a PR merges, the source branch is stale — any follow-up commits need a fresh branch off `main`, never the merged branch.
