/* @ds-bundle: {"format":4,"namespace":"AnuragBuildsThingsDesignSystem_d0c4d2","components":[],"sourceHashes":{"reference/palette.js":"6f4686ab6818","reference/post-enhance.js":"ad1d5a031516","ui_kits/website/Footer.jsx":"adf7e3d2975f","ui_kits/website/HomePage.jsx":"c63cfb48e594","ui_kits/website/ListingEntry.jsx":"f22a9d0de0bf","ui_kits/website/Navbar.jsx":"7a0d9fdd3834","ui_kits/website/NotFoundPage.jsx":"2bf3095c7e3f","ui_kits/website/PostPage.jsx":"79a1303e95ed"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AnuragBuildsThingsDesignSystem_d0c4d2 = window.AnuragBuildsThingsDesignSystem_d0c4d2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// reference/palette.js
try { (() => {
// palette.js - command palette for the site's search
//
// Binds ⌘K / Ctrl+K to open, Esc to close. Fetches /search.json (Quarto-generated)
// on first open, filters posts + sections + actions as you type, highlights
// matches inline, supports ↑↓ keyboard nav with Enter to open (Cmd+Enter for
// new tab). Hijacks the navbar search icon click so the existing affordance
// also opens this palette.

(function () {
  'use strict';

  var ACTIONS = [{
    title: 'Open GitHub',
    href: 'https://github.com/anurag4dsb',
    external: true,
    icon: 'git'
  }, {
    title: 'Open YouTube',
    href: 'https://www.youtube.com/@AnuragBuildsThings',
    external: true,
    icon: 'youtube'
  }, {
    title: 'Open LinkedIn',
    href: 'https://www.linkedin.com/in/mittalanu/',
    external: true,
    icon: 'linkedin'
  }, {
    title: 'Email me',
    href: 'mailto:anuragbuildsthings@gmail.com',
    external: false,
    icon: 'envelope-fill'
  }];
  var overlay, input, listEl, scopeBtns;
  var allIndex = null; // { posts: [], sections: [] }
  var currentScope = 'all';
  var currentQuery = '';
  var items = []; // flat list backing keyboard navigation
  var selIndex = 0;
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function escapeHtml(s) {
    return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function matches(str, q) {
    return !!str && String(str).toLowerCase().indexOf(q) !== -1;
  }
  function highlight(text, q) {
    if (!q || !text) return escapeHtml(text || '');
    var source = String(text);
    var lower = source.toLowerCase();
    var out = '';
    var i = 0;
    var qlen = q.length;
    while (i < source.length) {
      var idx = lower.indexOf(q, i);
      if (idx === -1) {
        out += escapeHtml(source.slice(i));
        break;
      }
      out += escapeHtml(source.slice(i, idx));
      out += '<em>' + escapeHtml(source.slice(idx, idx + qlen)) + '</em>';
      i = idx + qlen;
    }
    return out;
  }
  function normalizeHref(h) {
    if (!h) return '/';
    if (/^(https?:|mailto:|\/|#)/.test(h)) return h;
    return '/' + h;
  }
  function init() {
    overlay = qs('#cmd-palette');
    if (!overlay) return;
    input = qs('#palette-input', overlay);
    listEl = qs('#palette-list', overlay);
    scopeBtns = qsa('.palette-scopes button', overlay);
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Hijack Quarto's navbar search icon so the existing affordance opens us.
    var quartoSearch = qs('#quarto-search');
    if (quartoSearch) {
      quartoSearch.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
      }, true);
      quartoSearch.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      }, true);
    }
    scopeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setScope(btn.dataset.scope);
      });
    });
    input.addEventListener('input', function () {
      currentQuery = input.value.trim().toLowerCase();
      render();
    });
  }
  function onKey(e) {
    var isOpen = overlay.dataset.open === 'true';
    var mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (isOpen) close();else open();
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length) {
        selIndex = (selIndex + 1) % items.length;
        updateSelection();
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length) {
        selIndex = (selIndex - 1 + items.length) % items.length;
        updateSelection();
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      activate(selIndex, mod);
      return;
    }
  }
  function open() {
    overlay.dataset.open = 'true';
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    ensureIndex().then(function () {
      input.value = '';
      currentQuery = '';
      render();
      input.focus();
    });
  }
  function close() {
    if (document.activeElement && overlay.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    overlay.dataset.open = 'false';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function setScope(scope) {
    currentScope = scope;
    scopeBtns.forEach(function (b) {
      b.classList.toggle('on', b.dataset.scope === scope);
    });
    render();
  }
  function ensureIndex() {
    if (allIndex) return Promise.resolve();
    return fetch('/search.json', {
      cache: 'force-cache'
    }).then(function (r) {
      return r.json();
    }).then(function (raw) {
      var posts = [];
      var sections = [];
      var seen = {};
      raw.forEach(function (entry) {
        var href = entry.href || entry.objectID || '';
        var hasAnchor = href.indexOf('#') !== -1;
        var o = {
          title: entry.title || '',
          href: href,
          section: entry.section || '',
          text: entry.text || ''
        };
        var isPost = /(^|\/)posts\//.test(href);
        if (hasAnchor) {
          if (isPost && o.section && o.section.trim()) sections.push(o);
        } else {
          if (isPost && !seen[href]) {
            seen[href] = true;
            posts.push(o);
          }
        }
      });
      allIndex = {
        posts: posts,
        sections: sections
      };
    }).catch(function (err) {
      console.error('[palette] search.json fetch failed', err);
      allIndex = {
        posts: [],
        sections: []
      };
    });
  }
  function filter(arr, q, fields) {
    if (!q) return arr;
    return arr.filter(function (o) {
      return fields.some(function (f) {
        return matches(o[f], q);
      });
    });
  }
  function filterActions(q) {
    if (!q) return ACTIONS;
    return ACTIONS.filter(function (a) {
      return matches(a.title, q);
    });
  }
  function render() {
    if (!allIndex) return;
    var q = currentQuery;
    var isEmpty = !q;
    var posts = filter(allIndex.posts, q, ['title', 'text']);
    var sections = isEmpty ? [] : filter(allIndex.sections, q, ['title', 'section', 'text']);
    var actions = filterActions(q);
    var counts = {
      all: posts.length + sections.length + actions.length,
      posts: posts.length,
      sections: isEmpty ? allIndex.sections.length : sections.length,
      actions: actions.length
    };
    scopeBtns.forEach(function (btn) {
      var c = btn.querySelector('.count');
      if (c) c.textContent = counts[btn.dataset.scope] || 0;
    });
    var wantPosts = currentScope === 'all' || currentScope === 'posts';
    var wantSections = currentScope === 'all' || currentScope === 'sections';
    var wantActions = currentScope === 'all' || currentScope === 'actions';
    var sectionList = sections;
    if (currentScope === 'sections' && isEmpty) {
      sectionList = allIndex.sections.slice(0, 50);
    }
    var groups = [];
    if (wantPosts && posts.length) groups.push({
      label: 'Posts',
      items: posts,
      kind: 'post'
    });
    if (wantSections && sectionList.length) groups.push({
      label: 'Sections',
      items: sectionList,
      kind: 'section'
    });
    if (wantActions && actions.length) groups.push({
      label: 'Actions',
      items: actions,
      kind: 'action'
    });
    items = [];
    groups.forEach(function (g) {
      g.items.forEach(function (it) {
        items.push({
          group: g,
          data: it
        });
      });
    });
    selIndex = items.length ? 0 : -1;
    if (!items.length) {
      listEl.innerHTML = '<div class="p-empty">No results</div>';
      return;
    }
    var html = '';
    groups.forEach(function (g) {
      html += '<div class="p-group">';
      html += '<div class="p-group-lbl">' + escapeHtml(g.label) + '</div>';
      g.items.forEach(function (it) {
        html += renderItem(it, g.kind, q);
      });
      html += '</div>';
    });
    listEl.innerHTML = html;
    qsa('.p-item', listEl).forEach(function (el, i) {
      el.addEventListener('mouseenter', function () {
        selIndex = i;
        updateSelection();
      });
      el.addEventListener('click', function (e) {
        activate(i, e.metaKey || e.ctrlKey);
      });
    });
    updateSelection();
  }
  function renderItem(it, kind, q) {
    var ico, title, meta;
    if (kind === 'post') {
      ico = '¶';
      title = highlight(it.title || '', q);
      meta = '';
    } else if (kind === 'section') {
      ico = '§';
      title = highlight(it.section || it.title || '', q);
      meta = escapeHtml(it.title || '');
    } else {
      ico = '⌘';
      title = highlight(it.title || '', q);
      meta = it.icon ? '<i class="bi bi-' + escapeHtml(it.icon) + '" aria-hidden="true"></i>' : escapeHtml(it.kbd || '');
    }
    return '<div class="p-item" role="option">' + '<div class="p-ico">' + ico + '</div>' + '<div class="p-title">' + title + '</div>' + '<div class="p-meta">' + meta + '</div>' + '</div>';
  }
  function updateSelection() {
    var els = qsa('.p-item', listEl);
    els.forEach(function (el, i) {
      el.classList.toggle('sel', i === selIndex);
    });
    if (selIndex >= 0 && els[selIndex]) {
      els[selIndex].scrollIntoView({
        block: 'nearest'
      });
    }
  }
  function activate(idx, modEnter) {
    if (idx < 0 || idx >= items.length) return;
    var it = items[idx];
    var data = it.data;
    var kind = it.group.kind;
    var href;
    var external = false;
    if (kind === 'action') {
      external = !!data.external;
      href = data.href;
    } else {
      href = normalizeHref(data.href);
    }
    close();
    if (external || modEnter) {
      window.open(href, '_blank', 'noopener');
    } else {
      window.location.href = href;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "reference/palette.js", error: String((e && e.message) || e) }); }

// reference/post-enhance.js
try { (() => {
// post-enhance.js - Phase 2B
// Runs on post pages only. Builds:
//   1. A single thin meta line (date · reading time · word count)
//   2. Prev/next nav at the bottom of the article
//
// Detection: a post page has a #title-block-header AND no .standfirst.
// Index of all posts is read from /listing.json which Quarto generates
// automatically when `feed: true` is set on the listing.

(function () {
  'use strict';

  const isPostPage = () => document.querySelector('#title-block-header') && !document.querySelector('.standfirst');
  if (!isPostPage()) return;

  // ── 1. Build meta line ──────────────────────────────────────────
  function buildMetaLine() {
    const titleBlock = document.querySelector('.quarto-title-block');
    if (!titleBlock) return;
    const dateEl = titleBlock.querySelector('.quarto-title-meta .date, .quarto-title-meta-contents p.date');
    const date = dateEl ? dateEl.textContent.trim() : '';
    if (!date) return;
    const line = document.createElement('div');
    line.className = 'post-meta-line';
    line.innerHTML = `<span class="date">${date}</span>`;
    const description = titleBlock.querySelector('.description');
    if (description) {
      description.parentElement.insertAdjacentElement('afterend', line);
    } else {
      titleBlock.appendChild(line);
    }
  }

  // Category reordering is handled in CSS via flex order on
  // .quarto-title-block (see styles.css) - doing it in JS would shift
  // the description wrapper after DOMContentLoaded (visible CLS).

  // ── 2. Prev/next nav ────────────────────────────────────────────
  // Reads /listings.json for ordering, then /index.html for titles.
  async function buildPrevNext() {
    const normalize = p => (p || '').replace(/^\//, '').replace(/\/index\.html$/, '/');

    // 1. Get post URL ordering (date desc) from Quarto's listings.json
    let order = [];
    try {
      const res = await fetch('/listings.json', {
        cache: 'no-cache'
      });
      if (!res.ok) return;
      const data = await res.json();
      // shape: [{listing: "/index.html", items: ["/posts/a.html", ...]}]
      if (!Array.isArray(data) || !data[0] || !Array.isArray(data[0].items)) return;
      order = data[0].items;
    } catch (e) {
      return;
    }
    if (order.length === 0) return;
    const here = normalize(window.location.pathname);
    const idx = order.findIndex(p => normalize(p) === here);
    if (idx === -1) return;
    const olderUrl = order[idx + 1] || null;
    const newerUrl = order[idx - 1] || null;

    // 2. Fetch index.html once, extract titles for each post URL
    let titleMap = {};
    try {
      const res = await fetch('/index.html', {
        cache: 'no-cache'
      });
      if (res.ok) {
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('.quarto-post').forEach(post => {
          const a = post.querySelector('a[href]');
          if (!a) return;
          const path = normalize(new URL(a.getAttribute('href'), window.location.origin).pathname);
          const titleEl = post.querySelector('.listing-title, h3.no-anchor, .title');
          const title = (titleEl ? titleEl.textContent : a.textContent).trim();
          if (title) titleMap[path] = title;
        });
      }
    } catch (e) {
      // titles fall back to URL slug
    }
    const titleFor = url => {
      const path = normalize(url);
      if (titleMap[path]) return titleMap[path];
      const slug = path.split('/').pop().replace(/\.html$/, '').replace(/-/g, ' ');
      return slug.replace(/\b\w/g, c => c.toUpperCase());
    };
    const main = document.querySelector('main.content');
    if (!main) return;
    const footer = document.createElement('nav');
    footer.className = 'post-footer';
    footer.setAttribute('aria-label', 'Post navigation');
    const cell = (url, side) => {
      if (!url) {
        return `<span class="post-nav empty ${side}">
          <span class="post-nav-label">${side === 'prev' ? 'Start of log' : 'Latest entry'}</span>
          <span class="post-nav-title">-</span>
        </span>`;
      }
      const label = side === 'prev' ? '← Previous in log' : 'Next in log →';
      return `<a class="post-nav ${side}" href="${url}">
        <span class="post-nav-label">${label}</span>
        <span class="post-nav-title">${titleFor(url)}</span>
      </a>`;
    };
    footer.innerHTML = cell(olderUrl, 'prev') + cell(newerUrl, 'next');

    // Insert before the back-to-top button if present, else append
    const backToTop = main.querySelector('#quarto-back-to-top');
    if (backToTop) {
      backToTop.parentElement.insertBefore(footer, backToTop);
    } else {
      main.appendChild(footer);
    }
  }

  // ── 3. Dock post title into navbar at H1's x-position ───────────
  function wirePostTitleDock() {
    const titleBlock = document.querySelector('#title-block-header');
    if (!titleBlock || getComputedStyle(titleBlock).display === 'none') return;
    const navContainer = document.querySelector('.navbar-container.container-fluid') || document.querySelector('.navbar');
    const h1 = titleBlock.querySelector('h1.title');
    if (!navContainer || !h1) return;
    const title = h1.textContent.trim();
    if (!title) return;
    const dock = document.createElement('span');
    dock.className = 'post-title-dock';
    dock.setAttribute('aria-hidden', 'true');
    dock.textContent = title;
    navContainer.appendChild(dock);
    const alignEl = document.querySelector('main.content') || h1;
    const navbarEl = document.querySelector('.navbar');
    const updateDockLeft = () => {
      const rect = alignEl.getBoundingClientRect();
      const navRect = (navbarEl || navContainer).getBoundingClientRect();
      dock.style.setProperty('--dock-left', rect.left - navRect.left + 'px');
    };
    updateDockLeft();
    const ro = new ResizeObserver(updateDockLeft);
    ro.observe(document.body);
    const io = new IntersectionObserver(entries => {
      dock.classList.toggle('visible', !entries[0].isIntersecting);
    }, {
      rootMargin: '-80px 0px 0px 0px',
      threshold: 0
    });
    io.observe(h1);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      buildMetaLine();
      buildPrevNext();
      wirePostTitleDock();
    });
  } else {
    buildMetaLine();
    buildPrevNext();
    wirePostTitleDock();
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "reference/post-enhance.js", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
// Footer.jsx
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("span", null, "For the next person figuring things out by building \u2014 ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:anuragbuildsthings@gmail.com"
  }, "anuragbuildsthings@gmail.com")), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, "\u2B06 BACK TO TOP")));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomePage.jsx
try { (() => {
// HomePage.jsx — homepage with hero typewriter rotator + status strip + filtered listing
const POSTS = [{
  slug: 'augmentations-are-the-model',
  title: 'Augmentations Are the Model',
  description: "Four augmentation recipes on CIFAR-10, held constant everywhere else. The result isn't subtle — and the pattern has a cleaner explanation than 'stronger is better'.",
  date: '15 APR 2026',
  categories: ['SELF-SUPERVISED-LEARNING', 'CONTRASTIVE-LEARNING', 'AUGMENTATIONS'],
  image: '../../assets/figures/fig-ablation.png',
  imageAlt: 'Linear probe accuracy by augmentation recipe.'
}, {
  slug: 'why-augmentations-matter',
  title: 'Why Augmentations Matter',
  description: 'In contrastive learning, augmentations define the equivalence relation. Architecture and batch size are secondary.',
  date: '02 APR 2026',
  categories: ['SELF-SUPERVISED-LEARNING', 'AUGMENTATIONS'],
  image: '../../assets/figures/fig-aug-matrix.png',
  imageAlt: 'Augmentation matrix.'
}, {
  slug: 'ssl-representation',
  title: 'SSL Representations: What Gets Learned',
  description: 'Probing the geometry of self-supervised features — invariances, alignment, and the gap between linear-probe accuracy and downstream transfer.',
  date: '24 MAR 2026',
  categories: ['SELF-SUPERVISED-LEARNING', 'REPRESENTATION-LEARNING'],
  image: '../../assets/figures/fig-simclr.png',
  imageAlt: 'SimCLR diagram.'
}, {
  slug: 'self-supervised-learning',
  title: 'Self-Supervised Learning',
  description: 'Core intuition behind self-supervised learning: why it works, when to use it, and how it connects to real systems.',
  date: '18 MAR 2026',
  categories: ['SELF-SUPERVISED-LEARNING', 'REPRESENTATION-LEARNING', 'FUNDAMENTALS'],
  image: '../../assets/figures/fig-ssl-overview.png',
  imageAlt: 'Four pretext tasks.'
}];
const ROTATOR_WORDS = ['things', 'RAG', 'intelligent systems', 'systems', 'world models'];
const TYPE_MS = 75,
  BACK_MS = 42,
  HOLD_MS = 2500,
  EMPTY_MS = 380;
function HeroRotator() {
  const [text, setText] = React.useState('things');
  const [longest, setLongest] = React.useState('intelligent systems');
  const idxRef = React.useRef(0);
  React.useEffect(() => {
    setLongest(ROTATOR_WORDS.reduce((a, b) => b.length > a.length ? b : a, ''));
    let cancelled = false;
    let timeout;
    const later = (fn, ms) => {
      timeout = setTimeout(fn, ms);
    };
    function typeIn(word, done) {
      let i = 0;
      const step = () => {
        if (cancelled) return;
        setText(word.slice(0, i));
        if (i < word.length) {
          i++;
          later(step, TYPE_MS);
        } else later(done, HOLD_MS);
      };
      step();
    }
    function backspace(done) {
      let cur = ROTATOR_WORDS[idxRef.current];
      let i = cur.length;
      const step = () => {
        if (cancelled) return;
        setText(cur.slice(0, i));
        if (i > 0) {
          i--;
          later(step, BACK_MS);
        } else later(done, EMPTY_MS);
      };
      step();
    }
    function loop() {
      typeIn(ROTATOR_WORDS[idxRef.current], () => {
        backspace(() => {
          idxRef.current = (idxRef.current + 1) % ROTATOR_WORDS.length;
          loop();
        });
      });
    }
    loop();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);
  return /*#__PURE__*/React.createElement("span", {
    className: "rotator",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ghost",
    "aria-hidden": "true"
  }, longest), /*#__PURE__*/React.createElement("span", {
    className: "stage",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "typed"
  }, text), /*#__PURE__*/React.createElement("span", {
    className: "cursor"
  })));
}
function StatusStrip({
  count
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "status-strip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "status-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pulse"
  }), "CURRENTLY"), /*#__PURE__*/React.createElement("span", {
    className: "value"
  }, "Linear probes on CIFAR-10")), /*#__PURE__*/React.createElement("div", {
    className: "status-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "LAST SHIPPED"), /*#__PURE__*/React.createElement("span", {
    className: "value"
  }, "15 APR 2026")), /*#__PURE__*/React.createElement("div", {
    className: "status-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "CADENCE"), /*#__PURE__*/React.createElement("span", {
    className: "value"
  }, "~2 / month")), /*#__PURE__*/React.createElement("div", {
    className: "status-cell right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "INDEX"), /*#__PURE__*/React.createElement("span", {
    className: "value"
  }, count, " entries")));
}
function HomePage({
  onOpenPost
}) {
  const [filter, setFilter] = React.useState('ALL');
  const allCats = React.useMemo(() => {
    const s = new Set();
    POSTS.forEach(p => p.categories.forEach(c => s.add(c)));
    return ['ALL', ...Array.from(s)];
  }, []);
  const filtered = filter === 'ALL' ? POSTS : POSTS.filter(p => p.categories.includes(filter));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "frame"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "hero-standfirst"
  }, "anurag builds ", /*#__PURE__*/React.createElement(HeroRotator, null)), /*#__PURE__*/React.createElement("p", {
    className: "hero-dek"
  }, "I build things to understand how they actually work. A question, a system built to answer it, a comparison against real data. Just the code, the curves, and what they actually mean."), /*#__PURE__*/React.createElement(StatusStrip, {
    count: filtered.length
  }), /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "THE LOG \xB7 ", filtered.length, " ", filtered.length === 1 ? 'ENTRY' : 'ENTRIES'), /*#__PURE__*/React.createElement("div", {
    className: "filter-chord"
  }, allCats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    className: `chip ${filter === c ? 'on' : ''}`,
    onClick: () => setFilter(c)
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "listing"
  }, filtered.map(p => /*#__PURE__*/React.createElement(ListingEntry, {
    key: p.slug,
    post: p,
    onOpen: onOpenPost
  })))));
}
window.HomePage = HomePage;
window.POSTS = POSTS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ListingEntry.jsx
try { (() => {
// ListingEntry.jsx
function ListingEntry({
  post,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("a", {
    className: "post-row",
    href: "#",
    onClick: e => {
      e.preventDefault();
      onOpen(post.slug);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "post-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "pr-title"
  }, post.title), /*#__PURE__*/React.createElement("p", {
    className: "pr-dek"
  }, post.description), /*#__PURE__*/React.createElement("div", {
    className: "pr-cats"
  }, post.categories.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    className: "chip"
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "pr-meta"
  }, post.date), /*#__PURE__*/React.createElement("div", {
    className: "pr-thumb"
  }, /*#__PURE__*/React.createElement("img", {
    src: post.image,
    alt: post.imageAlt || ''
  })));
}
window.ListingEntry = ListingEntry;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ListingEntry.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Navbar.jsx
try { (() => {
// Navbar.jsx
function Navbar({
  onNavigate,
  currentPage
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "navbar"
  }, /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('home');
    }
  }, "anurag builds ", /*#__PURE__*/React.createElement("em", null, "things")), /*#__PURE__*/React.createElement("div", {
    className: "nav-tools"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-tool",
    "aria-label": "Search",
    title: "Search (\u2318K)"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-search"
  })), /*#__PURE__*/React.createElement("button", {
    className: "nav-tool",
    "aria-label": "RSS"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-rss"
  })), /*#__PURE__*/React.createElement("a", {
    className: "nav-tool git",
    href: "https://github.com/anurag4dsb",
    "aria-label": "GitHub"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-git"
  })), /*#__PURE__*/React.createElement("a", {
    className: "nav-tool yt",
    href: "https://www.youtube.com/@AnuragBuildsThings",
    "aria-label": "YouTube"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-youtube"
  })), /*#__PURE__*/React.createElement("a", {
    className: "nav-tool li",
    href: "https://www.linkedin.com/in/mittalanu/",
    "aria-label": "LinkedIn"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-linkedin"
  }))));
}
window.Navbar = Navbar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Navbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/NotFoundPage.jsx
try { (() => {
// NotFoundPage.jsx
function NotFoundPage({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "page-404"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glyph"
  }, "404 signal lost", /*#__PURE__*/React.createElement("span", {
    className: "pulse",
    style: {
      marginLeft: 8
    }
  })), /*#__PURE__*/React.createElement("h1", null, "This page didn't compile."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Either the URL drifted, or the entry was never shipped."), /*#__PURE__*/React.createElement("div", {
    className: "actions"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('home');
    }
  }, "\u2190 Return to the index")));
}
window.NotFoundPage = NotFoundPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/NotFoundPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/PostPage.jsx
try { (() => {
// PostPage.jsx — single article view, mirrors the live post layout
function PostPage({
  slug,
  onNavigate
}) {
  const post = window.POSTS.find(p => p.slug === slug) || window.POSTS[0];
  const idx = window.POSTS.findIndex(p => p.slug === post.slug);
  const newer = idx > 0 ? window.POSTS[idx - 1] : null;
  const older = idx < window.POSTS.length - 1 ? window.POSTS[idx + 1] : null;
  const [activeToc, setActiveToc] = React.useState('the-question');

  // Body content keyed by slug. Hand-ported from reference/posts/ — voice canon.
  const bodies = {
    'augmentations-are-the-model': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
      id: "the-question"
    }, "The question"), /*#__PURE__*/React.createElement("p", null, "In the previous post I claimed augmentations are the most critical design choice in contrastive learning \u2014 that they define the invariances the model learns, and everything else (architecture, batch size, epochs) is secondary."), /*#__PURE__*/React.createElement("p", null, "That was a hypothesis. This post runs the experiment."), /*#__PURE__*/React.createElement("h2", {
      id: "setup"
    }, "Setup"), /*#__PURE__*/React.createElement("p", null, "Four augmentation recipes, held constant everywhere else: ResNet-18 encoder, NT-Xent loss, batch 512, 200 epochs, temperature 0.5, LARS optimizer with cosine decay."), /*#__PURE__*/React.createElement("pre", null, `┌────────────┬───────────────┬─────────────┐
│ config     │ linear probe  │ Δ vs minimal│
├────────────┼───────────────┼─────────────┤
│ minimal    │      48.3%    │      -      │
│ moderate   │      71.9%    │   +23.6 pp  │
│ full       │      83.7%    │   +35.4 pp  │
│ aggressive │      82.1%    │   +33.8 pp  │
└────────────┴───────────────┴─────────────┘`), /*#__PURE__*/React.createElement("h2", {
      id: "results"
    }, "Results"), /*#__PURE__*/React.createElement("p", null, "Three things jump out."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "1. The minimal run is barely better than a random projection."), " 48% on CIFAR-10 is not good. A logistic regression on raw pixels gets ~40%."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "2. Color jitter alone moves the needle more than anything else."), " The jump from moderate (71.9%) to full (83.7%) is almost entirely color jitter and blur."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "3. Aggressive is ", /*#__PURE__*/React.createElement("em", null, "worse"), " than full."), " Not much \u2014 but consistently, across 3 seeds. Too-strong augmentation breaks the positive pair."), /*#__PURE__*/React.createElement("div", {
      className: "callout callout-tip"
    }, /*#__PURE__*/React.createElement("div", {
      className: "callout-title"
    }, "TIP"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0
      }
    }, "Pick your augmentations the way you'd pick your labels. They ", /*#__PURE__*/React.createElement("em", null, "are"), " your labels, in contrastive learning.")), /*#__PURE__*/React.createElement("h2", {
      id: "cleaner-framing"
    }, "The cleaner framing"), /*#__PURE__*/React.createElement("p", null, "\"Stronger augmentation is better\" is the summary most people walk away with. I don't think that's right."), /*#__PURE__*/React.createElement("p", null, "The cleaner framing: ", /*#__PURE__*/React.createElement("strong", null, "augmentations define the equivalence relation"), ". A contrastive loss says \"these two things are the same.\" Augmentations determine what \"same\" means."), /*#__PURE__*/React.createElement("h2", {
      id: "takeaway"
    }, "Takeaway"), /*#__PURE__*/React.createElement("p", null, "Pick your augmentations the way you'd pick your labels. Everything else is compute."))
  };
  const body = bodies[post.slug] || /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    id: "the-question"
  }, "The question"), /*#__PURE__*/React.createElement("p", null, "This post recreation in the design system shows the visual chrome \u2014 the post body in this UI kit only renders the canonical example post in full. Pick ", /*#__PURE__*/React.createElement("em", null, "Augmentations Are the Model"), " from the home page to see the prose treatments."), /*#__PURE__*/React.createElement("h2", {
    id: "setup"
  }, "Setup"), /*#__PURE__*/React.createElement("p", null, "Headings, body copy, callouts, code blocks, and prev/next nav follow the same patterns regardless of post."));
  const tocItems = [{
    id: 'the-question',
    label: 'The question'
  }, {
    id: 'setup',
    label: 'Setup'
  }, {
    id: 'results',
    label: 'Results'
  }, {
    id: 'cleaner-framing',
    label: 'The cleaner framing'
  }, {
    id: 'takeaway',
    label: 'Takeaway'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "post-layout"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "toc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "toc-title"
  }, "ON THIS PAGE"), /*#__PURE__*/React.createElement("nav", null, tocItems.map(t => /*#__PURE__*/React.createElement("a", {
    key: t.id,
    href: `#${t.id}`,
    className: activeToc === t.id ? 'active' : '',
    onClick: e => {
      e.preventDefault();
      setActiveToc(t.id);
      document.getElementById(t.id)?.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      });
    }
  }, t.label)))), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("article", {
    className: "post-article"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "post-title"
  }, post.title), /*#__PURE__*/React.createElement("p", {
    className: "post-dek"
  }, post.description), /*#__PURE__*/React.createElement("div", {
    className: "post-cats"
  }, post.categories.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    className: "chip"
  }, c))), /*#__PURE__*/React.createElement("div", {
    className: "post-meta-line"
  }, /*#__PURE__*/React.createElement("span", null, post.date), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "7 MIN READ"), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "1,240 WORDS")), body, /*#__PURE__*/React.createElement("nav", {
    className: "post-footer",
    "aria-label": "Post navigation"
  }, older ? /*#__PURE__*/React.createElement("button", {
    className: "post-nav prev",
    onClick: () => onNavigate('post', older.slug)
  }, /*#__PURE__*/React.createElement("span", {
    className: "post-nav-label"
  }, "\u2190 Previous in log"), /*#__PURE__*/React.createElement("span", {
    className: "post-nav-title"
  }, older.title)) : /*#__PURE__*/React.createElement("span", {
    className: "post-nav prev",
    style: {
      opacity: 0.4,
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "post-nav-label"
  }, "Start of log"), /*#__PURE__*/React.createElement("span", {
    className: "post-nav-title",
    style: {
      color: 'var(--ink-3)'
    }
  }, "\u2014")), newer ? /*#__PURE__*/React.createElement("button", {
    className: "post-nav next",
    onClick: () => onNavigate('post', newer.slug)
  }, /*#__PURE__*/React.createElement("span", {
    className: "post-nav-label"
  }, "Next in log \u2192"), /*#__PURE__*/React.createElement("span", {
    className: "post-nav-title"
  }, newer.title)) : /*#__PURE__*/React.createElement("span", {
    className: "post-nav next",
    style: {
      opacity: 0.4,
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "post-nav-label"
  }, "Latest entry"), /*#__PURE__*/React.createElement("span", {
    className: "post-nav-title",
    style: {
      color: 'var(--ink-3)'
    }
  }, "\u2014")))));
}
window.PostPage = PostPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/PostPage.jsx", error: String((e && e.message) || e) }); }

})();
