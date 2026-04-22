// palette.js — command palette for the site's search
//
// Binds ⌘K / Ctrl+K to open, Esc to close. Fetches /search.json (Quarto-generated)
// on first open, filters posts + sections + actions as you type, highlights
// matches inline, supports ↑↓ keyboard nav with Enter to open (Cmd+Enter for
// new tab). Hijacks the navbar search icon click so the existing affordance
// also opens this palette.

(function () {
  'use strict';

  var ACTIONS = [
    { title: 'Open YouTube channel',  href: 'https://www.youtube.com/@AnuragBuildsThings', external: true, icon: 'youtube' },
    { title: 'Open LinkedIn',         href: 'https://www.linkedin.com/in/mittalanu/',     external: true, icon: 'linkedin' },
    { title: 'Open GitHub profile',   href: 'https://github.com/anurag4dsb',              external: true, icon: 'github' }
  ];

  var overlay, input, listEl, scopeBtns;
  var allIndex = null;       // { posts: [], sections: [] }
  var currentScope = 'all';
  var currentQuery = '';
  var items = [];            // flat list backing keyboard navigation
  var selIndex = 0;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
      if (idx === -1) { out += escapeHtml(source.slice(i)); break; }
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
      btn.addEventListener('click', function () { setScope(btn.dataset.scope); });
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
      if (isOpen) close(); else open();
      return;
    }

    if (!isOpen) return;

    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length) { selIndex = (selIndex + 1) % items.length; updateSelection(); }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length) { selIndex = (selIndex - 1 + items.length) % items.length; updateSelection(); }
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
    scopeBtns.forEach(function (b) { b.classList.toggle('on', b.dataset.scope === scope); });
    render();
  }

  function ensureIndex() {
    if (allIndex) return Promise.resolve();
    return fetch('/search.json', { cache: 'force-cache' })
      .then(function (r) { return r.json(); })
      .then(function (raw) {
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
            if (isPost && !seen[href]) { seen[href] = true; posts.push(o); }
          }
        });
        allIndex = { posts: posts, sections: sections };
      })
      .catch(function (err) {
        console.error('[palette] search.json fetch failed', err);
        allIndex = { posts: [], sections: [] };
      });
  }

  function filter(arr, q, fields) {
    if (!q) return arr;
    return arr.filter(function (o) {
      return fields.some(function (f) { return matches(o[f], q); });
    });
  }

  function filterActions(q) {
    if (!q) return ACTIONS;
    return ACTIONS.filter(function (a) { return matches(a.title, q); });
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
    if (wantPosts && posts.length) groups.push({ label: 'Posts', items: posts, kind: 'post' });
    if (wantSections && sectionList.length) groups.push({ label: 'Sections', items: sectionList, kind: 'section' });
    if (wantActions && actions.length) groups.push({ label: 'Actions', items: actions, kind: 'action' });

    items = [];
    groups.forEach(function (g) {
      g.items.forEach(function (it) { items.push({ group: g, data: it }); });
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
      g.items.forEach(function (it) { html += renderItem(it, g.kind, q); });
      html += '</div>';
    });
    listEl.innerHTML = html;

    qsa('.p-item', listEl).forEach(function (el, i) {
      el.addEventListener('mouseenter', function () { selIndex = i; updateSelection(); });
      el.addEventListener('click', function (e) { activate(i, e.metaKey || e.ctrlKey); });
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
    return '<div class="p-item" role="option">' +
      '<div class="p-ico">' + ico + '</div>' +
      '<div class="p-title">' + title + '</div>' +
      '<div class="p-meta">' + meta + '</div>' +
      '</div>';
  }

  function updateSelection() {
    var els = qsa('.p-item', listEl);
    els.forEach(function (el, i) { el.classList.toggle('sel', i === selIndex); });
    if (selIndex >= 0 && els[selIndex]) {
      els[selIndex].scrollIntoView({ block: 'nearest' });
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
