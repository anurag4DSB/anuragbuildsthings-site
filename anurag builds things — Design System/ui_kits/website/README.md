# Website UI Kit — anurag builds things

Pixel-faithful recreation of [anuragbuildsthings.com](https://anuragbuildsthings.com) — the homepage log, a full post page, and the 404. Built as a single-page React demo so reviewers can click through it.

## Files

- `index.html` — entry. Loads React + Babel from CDN, mounts the demo-router app.
- `tokens.css` — full token set + element styles. Imports Google Fonts and Bootstrap Icons via CDN.
- `Navbar.jsx` — sticky top bar with wordmark + tools (search, RSS, GitHub, YouTube, LinkedIn).
- `Footer.jsx` — mono signature line + back-to-top.
- `ListingEntry.jsx` — homepage post row (title, dek, chips, date, thumbnail).
- `HomePage.jsx` — hero standfirst with typewriter rotator + status strip + filter-chord + listing.
- `PostPage.jsx` — TOC sidebar + article (title, dek, chips, meta line, h2/h3 + prose + callouts + code) + prev/next nav.
- `NotFoundPage.jsx` — "signal lost" 404.

## Demo router

Three pages reachable from the strip at the bottom of every screen:
- **HOME** — hero + status strip + filter chips + 4-entry listing
- **POST** — full reproduction of "Augmentations Are the Model" with TOC, prose, callout, code, prev/next
- **404** — signal-lost glyph + italic display headline

Click any listing row on home to open that post. The post-page prev/next links walk the log.

## What's faithful

- Color tokens, font stack, all type sizes/tracking, hairline borders, hard corners
- Hero typewriter rotator (75ms type / 42ms backspace / 2.5s hold)
- Signal-pulse keyframe animation on status strip + 404 glyph
- Listing row hover (lime wash + title swap to signal)
- Filter chord behavior (active = solid signal fill)
- Callout left-rule colors (note=cool, warning=warm, tip=signal)
- Social-icon brand-color hover exceptions
- 1200px frame, 24px gutters, 200px TOC + 48px gap article grid

## What's simplified

- Search opens nothing (the live site has a ⌘K command palette wired to Quarto's `search.json`).
- TOC active state is click-driven, not scroll-spy.
- Only one post (`augmentations-are-the-model`) has full body content; the others render a stub.
- No code-block syntax highlighting (the live site uses GitHub Dark via Quarto).
- The "post title dock in navbar" interaction (visible on long article scrolls) is not implemented.
- No print stylesheet, no `prefers-reduced-motion` rotator fallback.

The point is component coverage, not 1:1 production parity.
