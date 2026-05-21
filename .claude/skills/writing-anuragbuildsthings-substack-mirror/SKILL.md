---
name: writing-anuragbuildsthings-substack-mirror
description: Use when mirroring a published anuragbuildsthings.com post to Substack, deciding whether a post is ready to be mirrored at all, or drafting the LinkedIn cross-post that goes out with the mirror.
---

# Mirroring anuragbuildsthings Posts to Substack

## Overview

The site at `anuragbuildsthings.com` is the canonical home. Substack is a distribution channel — same content, frozen-in-time, optimized for the email/newsletter format. This skill handles the translation from Quarto to Substack markdown, the metadata that matters for SEO (canonical URL above all), and the LinkedIn cross-post that goes out alongside.

Invoked by `writing-anuragbuildsthings-posts` after a narrative post is merged.

## When to use

- A narrative companion post has shipped on the site and you're ready to mirror it
- Drafting the LinkedIn announcement that goes out with the Substack version
- Deciding whether a post is ready for Substack at all

## When NOT to mirror

- **Living documents in early state.** Substack subscribers get one email per post and won't see later additions. Wait until the doc hits a milestone (~10 entries), then publish a discrete roundup post that shows current state and links to the live page for ongoing updates.
- **Within ~2 weeks of the last Substack publish.** Spaces out subscriber notifications.
- **When custom CSS carries significant weight.** Substack's editor flattens custom CSS. If a post's design matters as much as its words (e.g., the prompts post), the canonical does the visual work better. Mirror after audience builds, or skip.

## Differences from the site version

| Element | Site (qmd) | Substack |
|---|---|---|
| YouTube embed | HTML `<iframe>` in `{=html}` block | Paste URL on its own line; Substack auto-embeds |
| Title | Quarto frontmatter `title:` | Substack article title (free-form) |
| Subtitle | `description:` (often >140 chars) | Substack subtitle, ~140 char limit — **must compress** |
| Code blocks | Quarto fences, copy button | Standard markdown fences (no copy button) |
| Categories | `categories: [kebab-case]` | Substack tags, **Title Case** (different vocabulary) |
| Cross-link to other | None | `*Originally published at [anuragbuildsthings.com](url)*` at top of body |
| Canonical URL | Site IS the canonical | Set in Substack article settings (SEO-critical) |
| Smart quotes | Markdown source uses straight quotes; Quarto renders smart | Substack paste sometimes converts straight → curly in code blocks (breaks JSON) |

## Translation

1. Create `post-temp-data/{slug}-substack.md` (already gitignored as `post-temp-data/`).
2. Copy the qmd body. Drop the YAML frontmatter entirely.
3. Replace the Quarto YouTube iframe with a plain URL on its own line:
   ```
   https://www.youtube.com/watch?v={VIDEO_ID}
   ```
   When pasted on its own line in the Substack editor, it auto-embeds.
4. Add an italic cross-link at the top of the body, right after the (now-removed) iframe:
   ```
   *Originally published at [anuragbuildsthings.com](https://anuragbuildsthings.com/posts/{slug}.html).*
   ```
5. Convert Quarto-specific syntax:
   - `::: {.callout-note} ... :::` → blockquote `> ...` or plain prose (Substack has no callouts)
   - `::: {.prompt-card}`, `.prompt-note`, etc. → plain markdown (lose the CSS, keep the text)
6. Verify code blocks paste cleanly. Watch for curly quotes in JSON — Substack paste sometimes converts.

## Subtitle (~140 char limit)

The qmd's `description:` is usually too long. Compress.

Pattern that works: "Field notes from [concrete artifact]. What worked, what it cost, and the [N] settings worth knowing."

Lead with "field notes" or similar to signal *experience report*, not tutorial.

## Tags (Substack vocabulary)

Site categories are kebab-case for SEO. Substack tags are reader-facing — Title Case, no hyphens, broader vocabulary.

| Site category | Substack tag |
|---|---|
| `claude-code` | Claude |
| `agent-teams` | AI Agents |
| `ai-coding` | AI |
| `kubernetes` | Kubernetes |
| `csi` | (skip — too niche; use Software Engineering instead) |
| `prompts` | AI |
| `living-document` | (skip — meta-tag, not reader-facing) |

Aim for **3-5 tags**. Reach priority for technical posts: **AI > Claude > AI Agents > Software Engineering**.

## Canonical URL (the most important Substack setting)

In the Substack article's settings panel, find the **Canonical URL** field and paste the full site URL:

```
https://anuragbuildsthings.com/posts/{slug}.html
```

Without this: Google sees two pages with identical content and usually picks Substack (higher domain authority). The site loses credit even though it's the original.

**Set this every single time.** Easy to forget; SEO-critical.

## Cross-link from the site post back to Substack

Once published, open a small PR to the site that updates the post's callout-note:

```markdown
::: {.callout-note}
This is the companion post to the video below. The post is the reference card; the video is the walkthrough. Also on [Substack](https://anuragbuildsthings.substack.com/p/{substack-slug}).
:::
```

Use the clean subdomain URL form (`anuragbuildsthings.substack.com/p/{slug}`), not the share-link form (`open.substack.com/pub/...`) — the latter has UTM noise and tries to deep-link into the Substack mobile app.

## LinkedIn cross-post

Draft in `post-temp-data/linkedin-post.md` (gitignored).

### Structure

1. **Hook (first 3 lines must fit before LinkedIn's "...more" cutoff)** — concrete personal claim with specifics. Lead with experience, not market trend. "I tried this for X minutes when it shipped. Now I use it Y often." Not "we're seeing a rise in...".
2. **Inclusivity + low-effort pitch** — "wherever you are on that journey", "easy preview without much investment".
3. **Two takeaways or insights** — what you actually learned. Concrete.
4. **"Three things you'll learn in the video and writeup:"** + 3 bullets. *Name the destination* in the heading line — "from the walkthrough" is too abstract; the reader doesn't yet know what "the walkthrough" refers to.
5. **Project/company context line** — tag company via `@` dropdown in LinkedIn editor.
6. **Hat tip to specific collaborator** (optional) — tag them via `@`. Specific contribution, not generic gratitude. Specific + tagged = real credit, not sycophancy.
7. **Three links** — YouTube (with `?si=` share-tracking ID if you want analytics, otherwise clean URL), Substack, site. Each labeled distinctly.
8. **3-5 hashtags** — more than 5 hurts LinkedIn reach.

### LinkedIn-editor mechanics

- **Empty lines between bullets** — LinkedIn collapses single-line lists into a wall. Empty lines force visual separation.
- **`@`-tags must be typed in the editor.** Pasting literal `@CompanyName` as text doesn't tag. Delete the text, type `@`, pick from the dropdown.
- **Canonical URL** doesn't apply to LinkedIn — but reach is best with the YouTube link first (video preview cards perform well).
- **Don't lead with hashtags.** Bottom of post only.

### Common rationalizations to push back on

- "Add 'thanks to my manager' at the top" → reads sycophantic. Specific credit at the bottom with tagged person reads genuine.
- "Use 'hat tip' as plain text without tagging" → name-dropping. The `@`-tag IS the credit; without it the line is decoration.
- "Pack more hashtags for reach" → diminishing returns past 5, often hurts the algorithm.

## Workflow

1. Verify the site post is merged and live.
2. Create `post-temp-data/{slug}-substack.md`. Draft following the translation guide.
3. In Substack: New Article → paste body → set title → set subtitle (≤140 chars) → set canonical URL → set tags → set cover image (reuse site thumbnail) → preview → publish.
4. Open small PR to the site: add "Also on Substack" to the qmd's callout-note.
5. Draft LinkedIn cross-post in `post-temp-data/linkedin-post.md`. Iterate on the hook before publishing.
6. Post to LinkedIn — replace any literal `@CompanyName` / `@Person` text with `@` editor dropdown selections.

## Common mistakes

- **Forgetting the canonical URL.** Without it, Google credits Substack as the original.
- **Subtitle too long.** Substack truncates ungracefully. Compress to fit the limit before pasting.
- **Curly-quoted JSON in code blocks.** Substack paste sometimes converts straight quotes to smart quotes — JSON syntax breaks. Verify in preview.
- **Pasting literal `@Scality` or `@NicolasH` as text on LinkedIn.** Doesn't tag. Delete and use the `@` dropdown.
- **Generic LinkedIn hook.** "We're seeing a rise in AI agents" wastes the first 3 lines. Lead with personal specifics.
- **Living doc Substack mirror with five entries.** Subscribers get notified about the smallest version of a doc that will keep growing. Wait for milestone.
- **Pushing follow-up commits to a merged PR's branch.** Site cross-link update needs a fresh branch off main, not the original feature branch.

## Examples

- Substack draft template: `post-temp-data/substack-draft.md` (if present in working tree)
- LinkedIn post template: `post-temp-data/linkedin-post.md` (if present in working tree)
- Site cross-link example: callout-note in `posts/claude-code-agent-teams-real-work.qmd`
