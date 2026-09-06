/* ============================================================================
 * devhub-hf-theme.js — the dark ⇄ cream switch for the Head First kit.
 *
 * ONE THEME SYSTEM, NOT TWO. app.html already owns a theme: it stores
 * `devhub-theme` ('dark' | 'light'), applies it before first paint, and —
 * importantly — PUSHES it into the lesson iframe it renders pages in
 * (app.html toggleTheme(), which sets viewer.contentDocument's data-theme).
 *
 * An independent switch with its own storage key would fight that: opening a
 * lesson would silently clear the hub's preference, and viewing a lesson
 * through the hub would show two toggles disagreeing with each other. So this
 * script deliberately reuses the SAME key and the same attribute, and only
 * adds one value:
 *
 *     dark   → the espresso kit  (default; what the hub already means by dark)
 *     cream  → the cream kit
 *     light  → treated AS cream on kit pages
 *
 * That last mapping matters. devhub.css's `light` is a cool blue-grey built
 * for the old design; under the Head First kit it reads as a different site.
 * A kit page therefore renders the hub's "light" as the kit's cream, so the
 * hub's existing button keeps working and stays visually coherent.
 *
 * The floating button HIDES ITSELF inside an iframe, because there the hub's
 * own header control is the one in charge.
 *
 * This file also carries the CREAM CONTRAST REPAIR (see the block below the
 * switch). The two belong together: the repair only ever runs under cream, it
 * needs the same normalise() the switch uses to decide that, and pairing them
 * means the whole cream theme is one <script> on a page rather than two.
 *
 * USAGE: <script src="devhub-hf-theme.js"></script> once per kit page.
 * ========================================================================== */
(function () {
  'use strict';

  var KEY = 'devhub-theme';             // shared with app.html — do not fork
  var root = document.documentElement;
  var embedded = (function () {
    try { return window.top !== window.self; } catch (e) { return true; }
  })();

  function stored() {
    try {
      /* devhub-theme-v3 — ONE-TIME migration, identical to the one in
         app.html's head script and in each landing page's pre-paint script.
         Cream only became the default on 2026-09-01, so a user still carrying
         a stored 'dark' from before would never see the redesign. Flip once,
         then respect every later choice. All three bootstraps must run this:
         if only some did, moving between hub, landing page and lesson would
         flip the theme under the reader. */
      if (!localStorage.getItem('devhub-theme-v3')) {
        localStorage.setItem(KEY, 'cream');
        localStorage.setItem('devhub-theme-v3', '1');
        return 'cream';
      }
      return localStorage.getItem(KEY);
    } catch (e) { return null; }
  }

  // 'light' is the hub's word for "not dark"; on a kit page that means cream.
  /* CREAM IS THE DEFAULT (Bobby's 2026-09-01 reference mockup is cream): only an
     explicitly stored 'dark' keeps the espresso colorway. Restored from 2260122 —
     the merge took the cloud side of this whole file, correctly (it is the 14KB
     superset carrying the runtime repair), and that discarded this one line with
     it. 'light' is the hub's word for "not dark", so it maps to cream too. */
  function normalise(v) { return v === 'dark' ? 'dark' : 'cream'; }

  function apply(v) { root.setAttribute('data-theme', normalise(v)); }

  apply(stored());

  /* The hub sets data-theme on this document directly when its own button is
     pressed. Watch for that and re-normalise, so 'light' from the hub becomes
     cream here instead of falling through to devhub.css's blue-grey. */
  if (window.MutationObserver) {
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) {
        var v = root.getAttribute('data-theme');
        if (v !== normalise(v)) { apply(v); return; }
      }
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function build() {
    if (!root.hasAttribute('data-hf')) return;      // not a kit page
    if (embedded) return;                           // the hub's control governs
    if (document.querySelector('.hf-themebtn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hf-themebtn';

    function paint() {
      var cream = root.getAttribute('data-theme') === 'cream';
      btn.textContent = cream ? '☾ Dark' : '☀ Cream';
      btn.setAttribute('aria-label', cream ? 'Switch to the dark theme' : 'Switch to the cream theme');
    }

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'cream' ? 'dark' : 'cream';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint();
    });

    paint();
    document.body.appendChild(btn);
  }


  /* ══════════════════════════════════════════════════════════════════════
     CREAM CONTRAST REPAIR — the part CSS structurally cannot reach.

     513 pages carry their own <style> block, written over two years by
     cloning the last visualizer and editing the hexes. Those blocks hardcode
     dark grounds (`background:#0b1426`) and let the text inherit var(--text).
     In dark that is pale ink on navy. In cream, --text becomes #201e1d and
     the box goes black-on-black — 778 measured instances of it.

     A stylesheet cannot fix this, and not for want of trying: CSS has no way
     to ask "is this element's computed background dark?", and the class names
     are invented per page (.vcr-sandbox, .trigger-cell, .lc-step), so there
     is nothing shared to name. The browser, however, knows the answer
     exactly. So this asks it.

     WHY HUE-PRESERVING. The obvious repair is to slam unreadable text to one
     ink. That works and it destroys meaning: on a teaching site green is
     "this is the fix", red is "this is the bug", amber is "careful". So this
     keeps the hue and moves only the LIGHTNESS, just far enough to clear the
     threshold. A green stays green; it stops being invisible.

     Runs ONLY under cream, once per load, and again on added subtrees (the
     scenario engines build their nodes after load). Every change records the
     value it replaced, so switching back to dark restores the page exactly.
     ══════════════════════════════════════════════════════════════════════ */
  var MIN = 3.0;                 /* repair below this... */
  var AIM = 4.0;                 /* ...and climb to at least this when we can */

  function srgb(v){ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
  function lum(c){ return 0.2126*srgb(c[0]) + 0.7152*srgb(c[1]) + 0.0722*srgb(c[2]); }
  function ratio(a,b){ var hi=Math.max(a,b), lo=Math.min(a,b); return (hi+0.05)/(lo+0.05); }
  function parse(s){
    var m = s && s.match(/[\d.]+/g); if (!m) return null;
    return [ +m[0], +m[1], +m[2], m.length>3 ? +m[3] : 1 ];
  }
  function over(t,b){ var a=t[3]; return [t[0]*a+b[0]*(1-a), t[1]*a+b[1]*(1-a), t[2]*a+b[2]*(1-a), 1]; }

  /* Backgrounds composite: an 11%-alpha wash over a dark panel is not the wash,
     it is a slightly tinted dark. Walk up collecting translucent layers until
     something opaque, then paint them back down onto it.

     The cache holds each element's OWN parsed backgroundColor (opaque,
     translucent, or none) — a fact about that element alone, true no matter
     which descendant's walk reaches it or how many translucent layers that
     walk already collected below it. That is why this can cache every node
     it visits, not just a walk that happened to have zero translucent layers
     first (the previous version's cache only ever held the fully-composited
     RESULT, which — unlike a raw read — genuinely does depend on the caller's
     path, so it could only be reused by a caller with an identical, empty
     stack). A translucent-panel subtree with many text children previously
     re-read getComputedStyle for every shared ancestor once per child; this
     reads each ancestor's own background at most once per repair() pass. */
  function groundOf(el, cache){
    var stack = [], e = el, base = null;
    while (e && e.nodeType === 1){
      var c;
      if (cache.has(e)) { c = cache.get(e); }
      else { c = parse(getComputedStyle(e).backgroundColor); cache.set(e, c); }
      if (c && c[3] > 0){
        if (c[3] >= 0.999){ base = c; break; }
        stack.push(c);
      }
      e = e.parentElement;
    }
    if (!base) base = [255,255,255,1];
    for (var i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  }

  function toHsl(r,g,b){
    r/=255; g/=255; b/=255;
    var mx=Math.max(r,g,b), mn=Math.min(r,g,b), h=0, s=0, l=(mx+mn)/2, d=mx-mn;
    if (d){
      s = l > 0.5 ? d/(2-mx-mn) : d/(mx+mn);
      if (mx===r) h=(g-b)/d + (g<b?6:0); else if (mx===g) h=(b-r)/d+2; else h=(r-g)/d+4;
      h/=6;
    }
    return [h,s,l];
  }
  function hue2rgb(p,q,t){
    if(t<0)t+=1; if(t>1)t-=1;
    if(t<1/6) return p+(q-p)*6*t;
    if(t<1/2) return q;
    if(t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  }
  function toRgb(h,s,l){
    if (!s) { var v=Math.round(l*255); return [v,v,v]; }
    var q = l<0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
    return [Math.round(hue2rgb(p,q,h+1/3)*255), Math.round(hue2rgb(p,q,h)*255), Math.round(hue2rgb(p,q,h-1/3)*255)];
  }

  /* Move lightness in the one direction that can help, in small steps, and stop
     at the first value that clears AIM. Returns null if the hue simply cannot
     get there (pure yellow on white), so the caller can fall back to the ramp. */
  function relight(fg, bgLum){
    var hsl = toHsl(fg[0], fg[1], fg[2]);
    var up  = bgLum < 0.18;                       /* dark ground -> lighten */
    var best = null;
    for (var i = 1; i <= 20; i++){
      var l = up ? hsl[2] + i*0.045 : hsl[2] - i*0.045;
      if (l <= 0.04 || l >= 0.97) break;
      var rgb = toRgb(hsl[0], hsl[1], l);
      var cr = ratio(lum(rgb), bgLum);
      best = rgb;
      if (cr >= AIM) return rgb;
    }
    return best;
  }

  /* Two passes, not one interleaved loop. The original walked every node and,
     for each, READ getComputedStyle (visibility, color, groundOf's own reads)
     then immediately WROTE el.style.setProperty(color). That write invalidates
     style for the next node's read, so every fix forced a synchronous
     recalc on whatever came after it — measured at 10,458 getComputedStyle
     calls / 457ms of blocking time on one page's first pass. Collecting every
     decision first (pure reads + math, zero DOM writes) and applying them
     in a second loop (pure writes) means the browser can batch all the reads
     against one stable layout and all the writes against one repaint, same as
     the classic "read phase / write phase" fix for layout thrashing. */
  function repair(root, cache){
    var nodes = root.querySelectorAll('*');
    var toRestore = [];   // elements whose ground moved back to readable
    var toFix = [];        // {el, fixed:[r,g,b], bgL, done, origColor}

    // ---- READ PHASE: no DOM writes, safe to batch ----
    for (var i = 0; i < nodes.length; i++){
      var el = nodes[i];
      if (!el.firstChild || el.firstChild.nodeType !== 3) continue;
      if (!el.textContent.trim()) continue;
      var s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.1) continue;
      if (/text/.test(s.webkitBackgroundClip || s.backgroundClip || '')) continue;
      if (el.closest('[aria-hidden="true"]')) continue;

      var bg = groundOf(el, cache), bgL = lum(bg);
      var done = el.dataset.hfcFg !== undefined;

      /* An element we already fixed is NOT automatically finished. The CodeWalk
         and scenario engines build their chrome after this first pass, so a
         node can be measured against one ground and end up on another — which
         bakes in a colour chosen for a surface that no longer exists. Re-check
         whenever the ground has actually moved, and always re-derive from the
         ORIGINAL colour rather than from our own previous answer, or repeated
         passes would walk the lightness away a step at a time. */
      if (done && Math.abs(+el.dataset.hfcBg - bgL) <= 0.03) continue;

      var fg = parse(done ? el.dataset.hfcFg : s.color); if (!fg) continue;
      if (fg[3] < 0.999) fg = over(fg, bg);
      if (ratio(lum(fg), bgL) >= MIN){
        if (done) toRestore.push(el);              /* the ground moved and it reads now */
        continue;
      }

      var fixed = relight(fg, bgL);
      if (!fixed || ratio(lum(fixed), bgL) < MIN){
        fixed = bgL < 0.18 ? [242,232,219] : [32,30,29];          /* ramp fallback */
      }
      toFix.push({ el: el, fixed: fixed, bgL: bgL, done: done, origColor: s.color });
    }

    // ---- WRITE PHASE: no DOM reads, safe to batch ----
    for (var r = 0; r < toRestore.length; r++) restore(toRestore[r]);
    for (var f = 0; f < toFix.length; f++){
      var item = toFix[f], node = item.el;
      if (!item.done){
        node.dataset.hfcWas = node.style.getPropertyValue('color');
        node.dataset.hfcPri = node.style.getPropertyPriority('color');
        node.dataset.hfcFg  = item.origColor;
      }
      node.dataset.hfcBg = item.bgL.toFixed(4);
      node.style.setProperty('color', 'rgb(' + item.fixed[0] + ',' + item.fixed[1] + ',' + item.fixed[2] + ')', 'important');
    }
  }

  function restore(el){
    var was = el.dataset.hfcWas;
    el.style.removeProperty('color');
    /* setProperty, not cssText +=: rewriting cssText drops the !important flag
       on every other inline declaration, and an inline colour that WAS
       !important has to come back that way or the restore is not a restore. */
    if (was) el.style.setProperty('color', was, el.dataset.hfcPri || '');
    delete el.dataset.hfcWas; delete el.dataset.hfcPri;
    delete el.dataset.hfcFg;  delete el.dataset.hfcBg;
  }
  function undo(){
    var done = document.querySelectorAll('[data-hfc-fg]');
    for (var i = 0; i < done.length; i++) restore(done[i]);
  }

  var scheduled = false, mo = null;
  function run(){
    if (normalise(root.getAttribute('data-theme')) !== 'cream'){ undo(); return; }
    var cache = new Map();
    try { repair(document.body, cache); } catch (e) {}
    /* Drop the mutation records our own style writes just produced. Without
       this, observing 'style' would make the pass re-trigger itself; with it,
       we can watch inline-style changes (the demos recolour boxes that way)
       without ever reacting to ourselves. */
    if (mo) mo.takeRecords();
  }
  function schedule(){
    if (scheduled) return;
    scheduled = true;
    var go = function(){ scheduled = false; run(); };
    /* NOT (rIC || setTimeout)(go, 1): requestIdleCallback's second argument is
       an IdleRequestOptions object, so passing a number throws TypeError and
       the whole repair silently never runs. Branch instead. */
    if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 80 });
    else setTimeout(go, 1);
  }

  function startRepair(){
    /* The FIRST pass runs synchronously, not on idle. Deferring it means the
       page paints unreadable text and then corrects itself, which reads as a
       flash of broken layout — worse than the ~60ms this costs. Later passes
       (added subtrees, theme flips) are deferred, because by then there is
       something on screen and smoothness matters more than immediacy. */
    run();
    /* The scenario and CodeWalk engines build their nodes after load, so watch
       for added subtrees. childList only: our own writes are attribute changes,
       so this cannot feed itself. */
    if (window.MutationObserver){
      /* A class or inline-style change matters as much as a new node: the demos
         toggle .loaded / .done / .skipped and write el.style.background to
         change a box's GROUND, which can turn text that read a moment ago into
         text that does not. run() clears our own records via takeRecords(), so
         watching 'style' cannot feed itself. */
      mo = new MutationObserver(function(recs){
        for (var i = 0; i < recs.length; i++){
          if (recs[i].addedNodes.length || recs[i].type === 'attributes'){ schedule(); return; }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true,
                                  attributes: true, attributeFilter: ['class', 'style'] });
    }
    /* Re-evaluate when the theme flips, in either direction. */
    new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    /* The pass above is not enough on its own, and the reason is CSS transitions.
       Much of the site carries `transition: all .3s`, so when the theme's colours
       land, every colour and background ANIMATES for 300ms. getComputedStyle
       returns the value mid-flight, so a pass that runs during the animation
       measures intermediate ink on an intermediate ground — a surface that is
       not what finally gets painted. Two failures came out of that, both
       invisible in the dark theme:

         - deterministic: on angular-custom-directives, `.code-live` is still
           light ink at DOMContentLoaded AND at load, reads fine against its dark
           panel, so the pass skips it. The transition then completes to
           rgb(71,66,56) on rgb(5,10,20) — 1.99:1, unreadable, 6 of 6 loads.
         - the race: on angular-dynamic-components the ground is sampled at
           whatever frame the pass caught, so relight()'s `bgL < 0.18` fallback
           flips between light and dark ink — 3-5 of 6 fresh loads unreadable.

       Neither MutationObserver above can see it: an animating value produces no
       DOM mutation. So listen for the animation actually finishing. Our own
       writes can re-trigger a transition (property: all), hence the cap — the
       0.03 ground guard in repair() means repeated passes converge and stop
       writing, so this is a backstop against a pathological page, not the
       mechanism. `node tmp_creamrace.mjs` is the test. */
    var transPasses = 0;
    document.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'color' && e.propertyName !== 'background-color') return;
      if (transPasses++ > 60) return;
      schedule();
    }, true);
  }

  function boot() { build(); startRepair(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
