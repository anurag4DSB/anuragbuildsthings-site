// post-enhance.js — Phase 2B
// Runs on post pages only. Builds:
//   1. A single thin meta line (date · reading time · word count)
//   2. Prev/next nav at the bottom of the article
//
// Detection: a post page has a #title-block-header AND no .standfirst.
// Index of all posts is read from /listing.json which Quarto generates
// automatically when `feed: true` is set on the listing.

(function () {
  'use strict';

  const isPostPage = () =>
    document.querySelector('#title-block-header') &&
    !document.querySelector('.standfirst');

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

  // ── 1b. Move categories below the description, above the meta-line ───
  // Quarto emits .quarto-categories inside .quarto-title, right after <h1>.
  // We want: title → description → chips → date/meta-line. Move the node so
  // DOM order matches visual.
  function reorderCategories() {
    const titleBlock = document.querySelector('.quarto-title-block');
    if (!titleBlock) return;
    const cats = titleBlock.querySelector('.quarto-categories');
    if (!cats) return;
    const descWrapper = titleBlock.querySelector('.description')?.parentElement;
    if (!descWrapper) return;
    descWrapper.insertAdjacentElement('afterend', cats);
  }

  // ── 2. Prev/next nav ────────────────────────────────────────────
  // Reads /listings.json for ordering, then /index.html for titles.
  async function buildPrevNext() {
    const normalize = p => (p || '').replace(/^\//, '').replace(/\/index\.html$/, '/');

    // 1. Get post URL ordering (date desc) from Quarto's listings.json
    let order = [];
    try {
      const res = await fetch('/listings.json', { cache: 'no-cache' });
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
      const res = await fetch('/index.html', { cache: 'no-cache' });
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
          <span class="post-nav-title">—</span>
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
      dock.style.setProperty('--dock-left', (rect.left - navRect.left) + 'px');
    };
    updateDockLeft();

    const ro = new ResizeObserver(updateDockLeft);
    ro.observe(document.body);

    const io = new IntersectionObserver(entries => {
      dock.classList.toggle('visible', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 });
    io.observe(h1);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      buildMetaLine();
      reorderCategories();
      buildPrevNext();
      wirePostTitleDock();
    });
  } else {
    buildMetaLine();
    reorderCategories();
    buildPrevNext();
    wirePostTitleDock();
  }
})();
