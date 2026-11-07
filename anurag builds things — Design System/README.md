# anurag builds things — Design System

A design system extracted from [anuragbuildsthings.com](https://anuragbuildsthings.com), a personal blog by Anurag Mittal documenting experiments and systems built in public — primarily around self-supervised learning, contrastive learning, and applied ML research.

The internal codename for the visual system is **"Instrument"**. The site itself is built with [Quarto](https://quarto.org) on top of Bootstrap (Cosmo light + Darkly dark, both overridden into a single dark theme).

---

## Sources

- **Codebase** (read-only, attached as `anuragbuildsthings-site/`)
  - `_quarto.yml` — site config, theme, fonts, navbar, footer
  - `styles.css` — 2200+ lines of the Instrument theme on top of Bootstrap
  - `index.qmd` — homepage (hero standfirst with rotating words, status strip, post listing)
  - `posts/*.qmd` — four shipped posts on SSL, contrastive learning, augmentations
  - `post-enhance.js` — meta line + prev/next nav + nav title dock
  - `palette.js` — ⌘K command palette
  - `.planning/`, `PLAN.md` — author's own design + build history (informative)
- **Live site:** https://anuragbuildsthings.com
- **Author socials:** [GitHub](https://github.com/anurag4dsb), [YouTube](https://www.youtube.com/@AnuragBuildsThings), [LinkedIn](https://www.linkedin.com/in/mittalanu/)

A working copy of the most relevant source files lives in `reference/` for deep reference. Assets used by previews and UI kits live in `assets/`.

---

## CONTENT FUNDAMENTALS

The voice is the dominant brand asset. Read the four posts in `reference/posts/` for the canonical examples — every UI surface is downstream of this voice.

### Vibe in one line
**A research log written by someone who tests their own claims.** Not a thought-leader, not a tutorial. The author runs experiments, reports the curves, and tells you what they actually mean.

The site's own description: *"For the next person figuring things out by building."*

### Tone
- **First-person, unhedged.** "I build things to understand how they actually work." "I claimed augmentations are the most critical design choice. That was a hypothesis. This post runs the experiment."
- **Direct address to the reader is rare.** No "you'll learn", no "let me show you". Closer to lab-notebook than tutorial.
- **Confident but falsifiable.** Claims come with the experiment that would refute them. Heavy use of *"I'd check next"*, *"my guess"*, *"this is why X often disappoints"*.
- **Short sentences. Then a longer one to land the point.**

### Casing
- Page titles, post titles, navbar brand: **lowercase** (e.g. *"anurag builds things"*, *"why augmentations matter"*) **OR** **Title Case** for individual essay titles (*"Augmentations Are the Model"*). Both styles ship — title case for posts, lowercase for site chrome and the homepage standfirst.
- Section headings (`<h2>`): **Sentence case** (*"The question"*, *"The cleaner framing"*, *"What I'd check next"*).
- Mono labels: **ALL CAPS** with wide tracking (`letter-spacing: 0.12em` to `0.18em`). Used for status strip labels, category chips, navbar nav, post meta.
- Body copy: standard sentence case.

### "I" vs "you"
- "I" is the default. The author is writing in their own log.
- "you" is used sparingly — usually for a generalized takeaway ("Pick your augmentations the way you'd pick your labels.").
- "we" is avoided.

### Emoji
- **Never.** No emoji anywhere — body, UI labels, headings, or social blurbs.
- Unicode arrows are used sparingly: `←` `→` for prev/next nav, `⬆` for back-to-top.
- A signal-lime pulse dot (CSS, not character) is the closest thing to an emoji in the system.

### Specific examples (lifted verbatim)
- Site standfirst: *"I build things to understand how they actually work. A question, a system built to answer it, a comparison against real data. Just the code, the curves, and what they actually mean."*
- Post dek: *"Four augmentation recipes on CIFAR-10, held constant everywhere else. The result isn't subtle — and the pattern has a cleaner explanation than 'stronger is better'."*
- Section heading: *"The cleaner framing"* — landing-the-point as section title.
- Bolded inline conclusion: *"**Aggressive is *worse* than full.**"* — bold + nested italic on the surprising finding.
- 404: *"This page didn't compile. Either the URL drifted, or the entry was never shipped."* — domain-aware metaphor (compile/ship) instead of generic 404 copy.
- Footer signature: *"For the next person figuring things out by building"*.
- Hero rotator words: `things`, `RAG`, `intelligent systems`, `systems`, `world models`.

### Copy rules for new surfaces
1. Lead with a question or claim, not a preamble.
2. Prefer specifics over generalities. Numbers, configs, named techniques.
3. If you bold something, bold the conclusion — not the keyword.
4. Section heads should *land the point of the section*, not name the topic.
5. End sections with a takeaway sentence that could stand alone as a tweet.
6. Avoid: "let's dive in", "in this post", "as you can see", "comprehensive", "powerful", em-dash-comma-em-dash decoration. Use em-dashes sparingly and only between clauses.

---

## VISUAL FOUNDATIONS

### Overall vibe
A research instrument panel rendered as a website. Hard-cornered, hairline-ruled, near-black background, warm off-white type, a single lime-green signal color for accents, light italic display serifs for headlines, body serif for prose, mono for labels. Reads like a Bloomberg terminal that decided to be a literary journal.

### Color
- **Dark only.** No light mode. The Bootstrap `data-bs-theme="light"` toggle is hidden via CSS (`.quarto-color-scheme-toggle { display: none !important }`).
- **Paper:** `#0c0d0b` — near-black with a faint warm-green undertone (NOT pure black, NOT cool gray). Warm undertone matters; pure `#000` looks wrong.
- **Ink scale:** `#ecece4` → `#9da29a` → `#5e635c` → `#3a3d36` — four warm-off-white-to-charcoal steps for primary, secondary, metadata, deep-muted.
- **Rules:** `#22251f` (default hairline) and `#32362f` (slightly stronger). All borders are 1px or 2px.
- **The signal:** `#c8e25c` lime-green. It is **the accent**. Used for: links, `<em>`, focus rings, active TOC item, signal-pulse dot, hover states on nav icons, category chip hover, `::selection`. Use sparingly; one signal element per visual region.
- **Tints:** `--tint-warm` (`#e68a56`) for warning callouts, `--tint-cool` (`#7aa0d6`) for note callouts. These are the only two non-signal accent colors in the system.

### Type
- **Display — Fraunces** (variable opsz/wght/ital). Weight 300, often italic. Tight tracking (`-0.018em` to `-0.024em`). Used for page titles, post titles, h2 (italic), prev/next titles. Loaded via Google Fonts with `display=optional` on the live site to eliminate font-swap CLS.
- **Body — Newsreader** (variable opsz/wght/ital). Used for article prose, listing descriptions, hero dek. Sets `font-feature-settings: "ss01", "cv11", "tnum"` for stylistic alternates and tabular numerals.
- **UI sans — Inter Tight**. Light weight (300). Used for the homepage hero standfirst and the status-strip values — anywhere that wants a contemporary, slightly compressed sans against the serifs.
- **Mono UI — Atkinson Hyperlegible Mono**. Used for ALL CAPS labels, navbar items, post meta line, TOC, status strip labels, category chips. Always small (10–11px) with wide tracking.
- **Mono code — JetBrains Mono**. Code blocks and inline code only.
- **No font weights heavier than 500.** The system is intentionally light/airy. Where Bootstrap defaults to 700, it gets overridden to 300/400/500.

### Backgrounds
- **No imagery in the chrome.** No hero photo, no full-bleed banner, no illustration.
- **No gradients.** Anywhere. Solid `--paper` for the page; `--paper-up` for callouts/code/footer; `--paper-up-2` for rare two-deep surfaces.
- **No textures, no grain, no noise overlays.**
- **OG card** (`og-default.svg/png`) is a flat dark card with the brand wordmark. That's the closest thing to a brand image.

### Animation & motion
- **Fades and color swaps, that's it.** All transitions are `120ms ease` (hover) or `180ms ease` (the post-title nav dock fade-in).
- **No bounces, no springs, no scale animations.**
- **One signature animation: the signal-pulse.** A 2s `cubic-bezier(0.16, 1, 0.3, 1)` halo expansion on the signal-lime dot. Used in the homepage status strip ("CURRENTLY ●") and the 404 "signal lost" glyph.
- **One signature interaction: the typewriter rotator** in the hero. Types one of `things | RAG | intelligent systems | systems | world models` at 75ms/char, holds 2.5s, backspaces at 42ms/char, blinking 1Hz cursor.
- **`prefers-reduced-motion: reduce` is honored** — the rotator collapses to a static word, the title-dock skips its fade.

### Hover states
- **Lime swap.** Default `--ink-2` (or `--ink-3` for very muted) → `--signal` on hover. 120ms color transition.
- **Listing rows** add a 2.5%-opacity signal-tint background wash AND swap the title to lime simultaneously.
- **Code copy buttons** ghost in (opacity 0 → 1) on hover of the parent block.
- **Social-icon hover gets a brand color exception** — YouTube `#FF0000`, LinkedIn `#0A66C2`, Git → ink-white. The signal lime still does most icon hovers.

### Press/active states
- **No shrink, no scale.** Active state is implicit via `:focus-visible` (a 2px lime outline with 2px offset) and the `::selection` lime swatch.
- **`.filter-chord .chip.on`** — when a category filter is selected: solid signal-lime fill, paper-colored text. This is the only inverted-fill UI element in the system.

### Borders
- **Hairlines only.** 1px solid using `--rule` (default) or `--rule-hi` (chips, thumbnails).
- **2px lefts** for callouts, blockquotes, active TOC items.
- **Hard corners — `border-radius: 0`** is enforced everywhere via `!important` overrides on Bootstrap. There is exactly one circular element: the `.pulse` dot.

### Shadows
- **The system avoids shadows for elevation.** Surfaces step up via paper-up backgrounds + hairlines, never `box-shadow`.
- **The single shadow in the codebase** is the signal-pulse halo (`box-shadow: 0 0 0 6px rgba(200, 226, 92, 0)` animating to/from full opacity).

### Transparency & blur
- **No backdrop-filter, no blur.** The navbar is solid `--paper`, not translucent.
- **One use of rgba transparency:** `rgba(200, 226, 92, 0.025)` for the listing-row hover wash, and `rgba(200, 226, 92, 0.3)` for under-link border colors that strengthen on hover.

### Layout rules
- **Frame: 1200px max** (`75rem`) with `1.5rem` (24px) gutters. The hero, listing, and post column all share this frame.
- **Post page: explicit grid** — `200px TOC | 48px gap | 1200px article | 1fr flex-right` above 1044px wide; centered article without TOC between 768–1043px; full-width below.
- **Navbar is sticky** (`body.nav-fixed` adds 4.625rem padding-top to compensate, growing to 6.3125rem when items wrap).
- **The standfirst sets the visual rhythm** — wide measure, light italic display serif, tight leading. Every other major typographic moment echoes it (404, prev/next titles).

### Imagery
- **Post thumbnails are diagrams**, not photography. Charts, ablation tables, schematics. Black/dark backgrounds when possible to blend with the paper.
- **Object-fit: contain** on listing thumbnails — preserve aspect, never crop.
- **No warm/cool/grain treatments** — images render as-shot.

### Cards
- **There are no card components.** Listing entries are grid rows separated by 1px hairlines, not cards. Callouts are the closest thing — but they have no background border, only a 2px left rule + paper-up fill.
- **If you must build a card:** 1px `--rule-hi` border, `--paper-up` fill, hard corners, NO shadow.

### Iconography
See **ICONOGRAPHY** below.

---

## ICONOGRAPHY

### What's actually used in the codebase
- **Bootstrap Icons** (`bi bi-*` classes) — Quarto bundles these. Specific glyphs in use:
  - `bi-git` — GitHub link in navbar
  - `bi-youtube` — YouTube link
  - `bi-linkedin` — LinkedIn link
  - `bi-rss` — RSS feed link
  - `bi-envelope-fill` — email action in command palette
- **Quarto's Algolia search SVG** — magnifier glyph, color-overridden to `--ink-2` / `--signal` on hover.
- **Inline Unicode glyphs** — `←`, `→`, `⬆`, `¶` (palette posts), `§` (palette sections), `⌘` (palette actions). Used as text, not icons.
- **One CSS dot** — the `.pulse` element. Pure CSS, no SVG.

### Style
- **Outline / line-style only.** No filled icons except the single `bi-envelope-fill` in the palette and the `bi-rss` glyph.
- **Stroke weight:** Bootstrap Icons' default — roughly 1.5px equivalent at 24px. Don't mix with chunkier icon sets.
- **Sized small.** `1.375rem` (22px) at desktop, `1.125rem` (18px) on mobile. Search SVG `1.25rem` on mobile.
- **No emoji. No flags. No status checkmarks. No avatars.**

### How to use icons in this system
1. **First choice: link [Bootstrap Icons](https://icons.getbootstrap.com/) from CDN** — the live site already uses them. Stylesheet: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css`. Markup: `<i class="bi bi-rss"></i>`.
2. **Fallback (if you don't want the BS Icons CSS):** use [Lucide](https://lucide.dev) — same outline aesthetic, same stroke weight. Note this as a substitution.
3. **Color rule:** default `var(--ink-2)`, hover `var(--signal)`. Social icons get a brand-color hover exception (see "Hover states" above).
4. **Never draw icons inline as bespoke SVG paths.** Use a library glyph or omit.

### Logos & brand marks
- **Wordmark:** the navbar brand "anurag builds things" set in **Fraunces 500, italic, 1.375rem**, color `--ink` for "anurag builds" and `--signal` italic for "things". This IS the logo.
- **Favicon** (`assets/favicon.svg`) — the same idea reduced to a glyph: Fraunces italic "A" in `--ink` with a `--signal` dot.
- **OG card** (`assets/og-default.svg`, `og-default.png`) — flat `--paper` background, wordmark center-left, used for all post share cards site-wide.

---

## INDEX

```
.
├── README.md                 — this file
├── SKILL.md                  — Agent Skills entry point
├── colors_and_type.css       — tokens + semantic element styles
├── assets/
│   ├── favicon.svg           — wordmark glyph (lime dot)
│   ├── favicon-{32,192,512}.png
│   ├── og-default.{svg,png}  — share card
│   └── figures/              — sample post figures (diagrams, ablation)
├── reference/
│   ├── styles.css            — full Instrument theme (read-only mirror)
│   ├── post-enhance.js       — meta line + prev/next + nav title dock
│   ├── palette.js            — ⌘K command palette
│   ├── index.qmd             — homepage source
│   └── posts/*.qmd           — four shipped post sources (voice canon)
├── preview/                  — registered design-system cards (one HTML each)
└── ui_kits/
    └── website/              — pixel-faithful recreation of the live site
        ├── index.html        — interactive recreation: home + post + 404
        ├── HomePage.jsx
        ├── PostPage.jsx
        ├── NotFoundPage.jsx
        ├── Navbar.jsx
        ├── Footer.jsx
        ├── ListingEntry.jsx
        └── tokens.css        — copy of colors_and_type.css for the kit
```

### Where to start
- Designing a new surface? Read the **VISUAL FOUNDATIONS** section above, then `colors_and_type.css`.
- Writing copy? Read **CONTENT FUNDAMENTALS** above and a real post in `reference/posts/`.
- Building a UI? Open `ui_kits/website/index.html` in a browser, then crib components.
- Want to use this in production code (Claude Code)? See `SKILL.md`.

---

## CAVEATS

- **No font files are bundled.** All fonts are loaded from Google Fonts (matches the live site). If you need offline TTFs, download from [fonts.google.com](https://fonts.google.com): Fraunces, Newsreader, Inter Tight, JetBrains Mono, Atkinson Hyperlegible Mono.
- **Bootstrap Icons CSS is loaded from CDN** in the UI kit (mirrors what Quarto does). For fully offline use, vendor `bootstrap-icons.css` + the `fonts/` directory it ships with.
- **The UI kit is a recreation, not the source.** Component implementations are simplified for design-system use; production behavior lives in the Quarto site.
