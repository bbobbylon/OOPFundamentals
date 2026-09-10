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
 *
 * WHO LOADS IT: 522 pages — every lesson page (for the auto-scan), plus
 *   notebook.html and stats.html, which set data-notebook-app to skip the
 *   scan and only want window.DevHubNotebook.store.
 *
 * PERSISTS: localStorage 'dlh-notebook:entries' → an array of
 *   { id: '<file>::<anchor>', file, anchor, title, snippet, pageTitle, addedAt }.
 *   The id is the page file name plus the heading's slug, so an entry
 *   survives reloads and re-scans as long as the heading TEXT is unchanged.
 *   Rename a heading and its saved entry becomes an orphan: notebook.html
 *   still lists it and links to file#anchor, the anchor just no longer
 *   resolves. There is no migration; the learner removes it by hand.
 *
 * DEPENDS ON: nothing at load. Unlike the other engines this one does NOT
 *   inject its own CSS — the "+ Notebook" button (.dnb-btn) is styled by
 *   devhub.css, which every page carrying lesson sections already links.
 *
 * USED BY: notebook.html (lists/reviews the store, joining entry.file
 *   against tracks-data.js for track/section labels), stats.html (counts),
 *   and devhub-notebook-review.js (turns entries into Leitner flashcards
 *   through devhub-flashcards.js).
 * ========================================================================== */
(function (global) {
  'use strict';

  /** The single storage key. Everything the notebook knows lives under it (CODE-MAP §4). */
  var LS_KEY = 'dlh-notebook:entries';

  /** Read the entry list. Corrupt or missing storage reads as empty rather than throwing
   *  on a lesson page — the notebook must never break the lesson it decorates. */
  function loadAll() {
    try { var v = JSON.parse(localStorage.getItem(LS_KEY)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  /** Write the entry list. A full quota or private mode fails silently: the button
   *  toggles for this page view, the entry just won't be there after a reload. */
  function saveAll(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  /** CRUD over the entry list, exposed as DevHubNotebook.store. Every method re-reads
   *  storage rather than caching, so two open tabs never overwrite each other with a
   *  stale list. add() is idempotent on id; toggle() returns the NEW saved state. */
  var Store = {
    /** Every saved entry, oldest first (add() appends). notebook.html and stats.html both
     *  read this; neither may mutate the returned array — it is a fresh parse each call. */
    list: function () { return loadAll(); },
    /** Is this section already saved? Drives the "+ Notebook" button's saved/unsaved face,
     *  so it is called once per lesson section on every page load. */
    has: function (id) { return loadAll().some(function (e) { return e.id === id; }); },
    /** One entry by id, or null. Callers must handle null: an entry can vanish between
     *  render and click if the learner cleared the notebook in another tab. */
    get: function (id) { return loadAll().find(function (e) { return e.id === id; }) || null; },
    /** Append an entry, IDEMPOTENT on id — saving the same section twice is a no-op, not a
     *  duplicate, because the button is the same button on every visit to that lesson.
     *  Stamps addedAt so notebook.html can sort by recency without a second field. */
    add: function (entry) {
      var all = loadAll();
      if (all.some(function (e) { return e.id === entry.id; })) return all;
      entry.addedAt = Date.now();
      all.push(entry);
      saveAll(all);
      return all;
    },
    /** Drop an entry by id. Silently succeeds when the id is absent, which makes
     *  remove-then-add a safe way to refresh an entry's captured text. */
    remove: function (id) {
      var all = loadAll().filter(function (e) { return e.id !== id; });
      saveAll(all);
      return all;
    },
    /** Empty the notebook. Only notebook.html calls this, behind a confirm — there is no
     *  undo and the Leitner review boxes built from these entries go with it. */
    clear: function () { saveAll([]); },
    /** Save or unsave in one call, returning the NEW state (true = now saved) so the
     *  caller can repaint its button from the return value rather than re-querying. */
    toggle: function (entry) {
      if (Store.has(entry.id)) { Store.remove(entry.id); return false; }
      Store.add(entry); return true;
    }
  };

  /* ---- id / slug helpers -------------------------------------------------- */
  /** Heading text → stable anchor id (lower-case, [\w-] only, ≤60 chars, never empty).
   *  Exported because notebook.html must produce the identical slug to build links. */
  function slugify(text) {
    var s = String(text || '').toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
    return s || 'section';
  }

  /** This page's own file name — the `file` half of every entry id, and the key
   *  notebook.html joins against tracks-data.js to recover track and section. */
  function currentFile() {
    return (global.location.pathname.split('/').pop() || '').split('?')[0].split('#')[0] || 'index.html';
  }

  /* ---- snippet capture: first substantial text after the heading --------- */
  /** First substantial text after an <h2> (walks up to 4 siblings / first children),
   *  clipped to 180 chars. This becomes the flashcard BACK in the notebook's review modes,
   *  so it is the only content a learner will be asked to recall for this section. */
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

  /** The <h1>, else the part of <title> before the " — DevHub" suffix, else the file name. */
  function pageTitle() {
    var h1 = document.querySelector('h1');
    return (h1 && h1.textContent.trim()) || document.title.split('—')[0].trim() || currentFile();
  }

  /** ---- button widget -------------------------------------------------------
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
  /** Paint saved / unsaved onto a button — label, tooltip and the .saved class. */
  function setState(btn, saved) {
    btn.classList.toggle('saved', saved);
    btn.innerHTML = saved ? '<span aria-hidden="true">&#10003;</span> Saved' : '<span aria-hidden="true">&#128214;</span> Notebook';
    btn.title = saved ? 'Remove from your notebook' : 'Save this section to your notebook';
  }

  /** The auto-scan: give every <h2> outside nav/topbar/.dnb-skip a stable id and append a
   *  "+ Notebook" button. Runs once on DOMContentLoaded unless <html data-notebook-app>.
   *  Ids already present in the DOM are respected and never clobbered. */
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
