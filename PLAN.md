# anuragbuildsthings.com - Build Plan

Living doc. Update as we ship, deviate, or reprioritize.
Last updated: Phase 2B complete, starting Phase 2C.

---

## Phase 1 - Design system & theme foundation ✅

- [x] Color tokens (ink scale, surface, signal lime)
- [x] Type system (Newsreader display, Source Serif body, JetBrains Mono)
- [x] Dark theme baseline
- [x] CSS variables wired through `styles.css`
- [x] Quarto theme config (`_quarto.yml` with `theme: [cosmo, styles.css]` light + `[darkly, styles.css]` dark)

## Phase 2A - Home page (the log) ✅

- [x] Standfirst paragraph (replaces page H1)
- [x] Status strip (Currently / Last shipped / Cadence / Index count)
- [x] Filter chip row (categories)
- [x] Listing rows: 140px image + title + dek + categories + date
- [x] Hide default Quarto title block
- [x] Live entry counter that updates with filter
- [x] Inline JS in `index.qmd` for filter + count

## Phase 2B - Post pages ✅

- [x] Refined article header (title in serif, narrower measure)
- [x] Italic dek under title
- [x] `filed:` inline category links (mono, hover state, middle-dot separator)
- [x] Single meta line: date · reading time · word count
- [x] Hide duplicate Quarto meta block
- [x] Prev/next post nav at bottom (pulls titles from listings.json + index.html)
- [x] Code blocks: subtle border + ghost copy button on hover
- [x] `post-enhance.js` runs once via `_quarto.yml include-after-body` (not duplicated in `_metadata.yml`)

**Deviations:** original plan called for italic `filed:` text - switched to mono caps after seeing it render; reads more like a research log header.

## Phase 2C - Site chrome ✅

- [x] **Footer** - three-column: about / subscribe / colophon (padded sides, no auto-mirrored icons)
- [x] **RSS button in nav** - added as nav-tool with `icon: rss → /index.xml`
- [x] **404 page** - `404.qmd` with "signal lost" glyph, italic display headline, action links
- [x] **Print stylesheet** - `@media print` block; drops nav/sidebar/footer, light bg, serif body
- [x] **Back-to-top restyled** - pinned bottom-right, mono caps, lime-green hover

**Deviations:** initial print stylesheet expanded every external URL inline (`a[href^="http"]::after`), which made the home-page listing print as cluttered link-soup. Removed that rule; clean prose-only print.

## Phase 3 - Content & launch polish (in progress)

- [x] **About page** (`about.qmd`) - shipped with italic display headline + sectioned layout. **TODO later: refine spacing/fonts; currently feels airy. Anurag will polish.**
- [x] **Open Graph cards** - site-wide default at `og-default.svg`; all posts have `image:` pointing to it. Replace per-post with custom cards when you want.
- [x] **Review existing 3 posts** - all now have `image:` + `image-alt:`. Front-matter (date, categories, description) was already clean.
- [x] **Post #4** - "Augmentations Are the Model" - continues the thread from the previous planned post; shows the theme at full tilt.
- [x] **Favicon** - mono "A" italic with lime-green signal dot (`favicon.svg`); wire via `_quarto.yml`.

## Phase 4 - Possibly later (parking lot)

- [ ] Category index pages styled (`/categories/<slug>`) - only if linked to externally
- [ ] Search overlay polish (Quarto's default works but could be themed)
- [ ] Newsletter integration (Buttondown / Substack embed) - if you decide to add one
- [ ] Comment system (giscus / utterances) - if you want them
- [ ] Analytics review - GA4 already wired (G-2QD3FPQKQ8); maybe Plausible later
- [ ] Math rendering check (KaTeX/MathJax) - if posts use equations
- [ ] Image lightbox for figures
- [ ] Series/collections (linked posts under a single thread)

---

## File map (where things live)

- `_quarto.yml` - site config, theme, navbar, footer
- `index.qmd` - home page (standfirst, status strip, filter, listing)
- `styles.css` - all custom CSS (tokens, components, post-page treatments)
- `post-enhance.js` - runs on every page; builds meta line + prev/next nav
- `post-enhance-include.html` - one-line wrapper that loads `post-enhance.js`
- `posts/_metadata.yml` - defaults for all posts (toc, layout)
- `posts/*.qmd` - individual entries
- `quarto-theme/` - working copies of CSS/JS we edit, then copy into the site folder

## Conventions

- Edit in `quarto-theme/`, then `cp` into `anuragbuildsthings-site/`
- After CSS or JS changes: `rm -rf _site .quarto && quarto preview`
- Hard refresh the browser: Cmd+Shift+R
- Plan updates: edit this file, don't create new plan docs
