/* ============================================================================
 * devhub-notebook.js — DevHub's personal notebook: quick-add + auto-scan.
 *
 * Lets a learner save any lesson section into their own study set with one
 * click, without leaving the page. Two jobs live in this one file:
 *
 *   1. NotebookStore — a tiny localStorage CRUD layer. Entries are just
 *      {id, file, anchor, title, snippet, addedAt} — deliberately NOT
 *      carrying track/section labels, because that would duplicate
 *      tracks-data.js on every page load. notebook.html (which already
 *      loads tracks-data.js) resolves file -> track/section at display time.
 *      This keeps every content page's footprint to one small script tag.
 *
 *   2. Auto-scan — on page load, finds every <h2> section heading, gives it
 *      a stable id (slugified from its own text, so it survives across
 *      sessions as long as the heading text doesn't change), and appends a
 *      small "+ Notebook" button. This is the ONLY sitewide affordance the
 *      feature needs; no per-page markup changes required beyond one
 *      <script src="devhub-notebook.js"></script> tag before </body>.
 *
 * USAGE: <link rel="stylesheet" href="devhub.css"> (button styles live there)
 *        <script src="devhub-notebook.js"></script>
 *
 * notebook.html sets <html data-notebook-app> to opt OUT of the auto-scan
 * (it has its own h2 headings that aren't lesson sections) while still
 * loading this file for direct access to window.DevHubNotebook.store.
 * ========================================================================== */
(function (global) {
  'use strict';

  var LS_KEY = 'dlh-notebook:entries';

  function loadAll() {
    try { var v = JSON.parse(localStorage.getItem(LS_KEY)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function saveAll(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  var Store = {
    list: function () { return loadAll(); },
    has: function (id) { return loadAll().some(function (e) { return e.id === id; }); },
    get: function (id) { return loadAll().find(function (e) { return e.id === id; }) || null; },
    add: function (entry) {
      var all = loadAll();
      if (all.some(function (e) { return e.id === entry.id; })) return all;
      entry.addedAt = Date.now();
      all.push(entry);
      saveAll(all);
      return all;
    },
    remove: function (id) {
      var all = loadAll().filter(function (e) { return e.id !== id; });
      saveAll(all);
      return all;
    },
    clear: function () { saveAll([]); },
    toggle: function (entry) {
      if (Store.has(entry.id)) { Store.remove(entry.id); return false; }
      Store.add(entry); return true;
    }
  };

  /* ---- id / slug helpers -------------------------------------------------- */
  function slugify(text) {
    var s = String(text || '').toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
    return s || 'section';
  }

  function currentFile() {
    return (global.location.pathname.split('/').pop() || '').split('?')[0].split('#')[0] || 'index.html';
  }

  /* ---- snippet capture: first substantial text after the heading --------- */
  function captureSnippet(h2) {
    var el = h2.nextElementSibling, tries = 0;
    while (el && tries < 4) {
      var txt = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (txt.length > 20) return txt.length > 180 ? txt.slice(0, 177) + '…' : txt;
      if (el.children && el.children.length) { el = el.children[0]; tries++; continue; }
      el = el.nextElementSibling; tries++;
    }
    return '';
  }

  function pageTitle() {
    var h1 = document.querySelector('h1');
    return (h1 && h1.textContent.trim()) || document.title.split('—')[0].trim() || currentFile();
  }

  /* ---- button widget -------------------------------------------------------
     Appended as the last child of each <h2>. Text/state driven purely by
     Store.has(id) so a page can be reloaded and buttons come back correct. */
  function makeButton(entry) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dnb-btn';
    setState(btn, Store.has(entry.id));
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var saved = Store.toggle(entry);
      setState(btn, saved);
    });
    return btn;
  }
  function setState(btn, saved) {
    btn.classList.toggle('saved', saved);
    btn.innerHTML = saved ? '<span aria-hidden="true">&#10003;</span> Saved' : '<span aria-hidden="true">&#128214;</span> Notebook';
    btn.title = saved ? 'Remove from your notebook' : 'Save this section to your notebook';
  }

  function scan() {
    var file = currentFile();
    var title = pageTitle();
    var used = {};
    // Pre-seed used-id set with every id already in the DOM so we never clash
    // with a heading's pre-existing id (some pages already anchor their h2s).
    Array.prototype.forEach.call(document.querySelectorAll('[id]'), function (el) { used[el.id] = true; });

    var heads = Array.prototype.slice.call(document.querySelectorAll('h2'));
    heads.forEach(function (h2) {
      if (h2.closest('#topbar, nav, .dnb-skip')) return;
      var text = h2.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;

      var anchor = h2.id;
      if (!anchor) {
        var base = slugify(text), candidate = base, n = 2;
        while (used[candidate]) { candidate = base + '-' + n; n++; }
        anchor = candidate;
        h2.id = anchor;
      }
      used[anchor] = true;

      var entry = {
        id: file + '::' + anchor,
        file: file,
        anchor: anchor,
        title: text,
        snippet: captureSnippet(h2),
        pageTitle: title
      };
      h2.appendChild(makeButton(entry));
    });
  }

  global.DevHubNotebook = { store: Store, slugify: slugify };

  if (!document.documentElement.hasAttribute('data-notebook-app')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scan);
    } else {
      scan();
    }
  }
})(window);
