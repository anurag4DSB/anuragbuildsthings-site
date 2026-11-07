# SKILL: anurag builds things — design system

Use this skill when designing or writing for **anuragbuildsthings.com** or any surface that should feel like it's by Anurag Mittal — research-log voice, dark Instrument theme, contrastive-learning subject matter.

## When to apply

- New post pages, listing variants, or homepage redesigns for the site
- Marketing or social cards that need to match the site's voice and chrome
- Decks, write-ups, or PDFs presenting Anurag's work
- Internal tools or dashboards that should adopt the same look (rare; ask first)

## When NOT to apply

- Generic ML or research design — this voice is specific. Use a neutral system instead.
- Light-mode anything. The Instrument theme is dark-only by design; do not invent a light variant without explicit instruction.
- Marketing-tone or product-launch copy. The voice is a research log, not a sales page.

## Required reading before designing

Always open these first:

1. `README.md` — full system overview (voice, casing, palette, type, components)
2. `colors_and_type.css` — token source of truth
3. At least one full post in `reference/posts/` — voice canon

The voice is the dominant brand asset. Get the voice right and the visuals will follow; get the visuals right with the wrong voice and the surface still feels off.

## Hard rules

- **Background is `#0c0d0b`.** Not pure black, not gray. The off-black with the warm bias is load-bearing.
- **The signal color (`#c8e25c`) is for one thing per view.** Active state, current rotator word, key link in body copy, hover-on-row title color. If two things on screen are signal-colored, one of them is wrong.
- **Hairline rules, never boxes.** Cards, panels, and rounded containers are not in the vocabulary. Sections are separated by 1px `--rule` lines top and bottom; that is the divider system.
- **Mono caps for any label, ever.** Status labels, category chips, post meta, navbar items, footer — all `--mono` (Atkinson Hyperlegible Mono), 10–12px, `letter-spacing: 0.12em–0.18em`, `text-transform: uppercase`.
- **Display type is Fraunces italic for editorial weight, Inter Tight light for the homepage hero.** Don't swap them.
- **Body copy is Newsreader, 19px, line-height 1.65.** Long-form prose only — never use Newsreader for UI.
- **No emoji.** No decorative icons. Bootstrap Icons are used for tools/socials only (search, RSS, GitHub, YouTube, LinkedIn).
- **No gradients. No drop shadows. No rounded corners on containers.** Hard 0px radii everywhere except the signal-pulse halo (which is a keyframe, not a static shadow).

## Voice rules (for any copy you write)

- First-person ("I"). "We" is banned. "You" is rare and reserved for generalized takeaways.
- Lead with the question. Then the setup. Then the result. Then what it means.
- Claims must be falsifiable. If you write "augmentations matter," show the experiment that would prove they don't.
- Section headings are sentence-case ("The question", "What I'd check next"). Not "Question" or "Conclusion".
- Post titles can be Title Case ("Augmentations Are the Model") OR lowercase ("why augmentations matter"). Both ship.
- Site chrome and the homepage standfirst are lowercase ("anurag builds things").
- Avoid: "leverage", "robust", "powerful", "in this post we'll explore", "you'll learn", "let's dive in".
- Use sparingly: em-dashes for a beat-shift, italic <em> for emphasis (renders in `--signal` — pick the word that earns it).

## Component canon (in `ui_kits/website/`)

| Component | Use for |
|---|---|
| `Navbar` | Sticky top bar; wordmark + tools group on the right |
| `HomePage` hero standfirst + rotator | The site's identity. Don't replicate it on subpages |
| `StatusStrip` | A 4-column hairline strip of mono labels + values. Use to telegraph current state |
| `ListingEntry` (post-row) | Any chronological log of essays/experiments |
| `PostPage` (TOC + article) | Long-form essays. TOC is sticky on left, body is 760px max |
| `Callout` (note/warning/tip) | Flagging an aside. One per ~800 words at most |
| `NotFoundPage` | Error states. Italic display headline + mono "signal lost" glyph |
| `Footer` | Mono signature + back-to-top. Always at the bottom |

## Iconography

Bootstrap Icons (`bi`) only, line-style, ~22px. Allowed set is essentially: `bi-search`, `bi-rss`, `bi-git`, `bi-youtube`, `bi-linkedin`, `bi-arrow-up`, `bi-arrow-right`, `bi-arrow-left`. If you need an icon outside that set, you're probably solving the wrong problem with iconography.

## Quick checklist before shipping

- [ ] Background is `--paper` (`#0c0d0b`), not generic dark gray
- [ ] One signal-color element per visible region
- [ ] Every label is mono, ALL-CAPS, tracked
- [ ] Body copy is Newsreader 19px / 1.65
- [ ] No rounded containers, no shadows, no gradients
- [ ] Hairline `--rule` separates sections
- [ ] Voice is first-person, falsifiable, sentence-case headings
- [ ] No emoji, no decorative icons

## Escape hatch

If you're tempted to invent a new color, font, or container shape: stop and ask. The system is intentionally narrow. New tokens get added through the README, not ad-hoc in the surface you're building.
