/* ============================================================================
 * tmp_smoke.mjs — load every page in a real browser and report what breaks.
 *
 * THE QUESTION IT ANSWERS
 *   "Does every page actually RUN — no uncaught exception, no console error,
 *   no horizontal overflow at phone width, something rendered — and does its
 *   <head> avoid render-blocking cross-origin resources?" Text clipped inside
 *   a non-scrolling box is measured too and reported as a separate,
 *   non-fatal section.
 *
 * HOW TO RUN
 *   node frontend/tmp_smoke.mjs                   # every page, 320px wide
 *   node frontend/tmp_smoke.mjs head-first-*      # a subset (shell-globbed)
 *   node frontend/tmp_smoke.mjs --width=390       # a roomier phone
 *   node frontend/tmp_smoke.mjs --width=1440      # desktop instead of phone
 *   Needs a browser: tmp_pw.mjs resolves playwright (global install, or
 *   $PW_MODULE, or playwright-core paired with system Chrome/Edge). Serves
 *   frontend/ over a local http server, 4 pages in parallel. Exit 1 on any
 *   real problem. NOT wired into deploy.yml (a browser download is a heavy
 *   dependency for a per-push gate) — run it before a merge or after any
 *   bulk edit.
 *
 * WHAT A FAILURE MEANS
 *   A "real problem" is a page a learner sees broken: a thrown error (the
 *   interactive engine is dead from that line on), overflow (the phone layout
 *   scrolls sideways), almost no text (the page did not render), or a
 *   render-blocking external <link>/<script> in <head> (a solid blank
 *   rectangle on a slow host — angular-material-cdk sat at 13s FCP). A clean
 *   run means nothing threw ON LOAD at this width. It does not mean every
 *   button works, every scenario renders, or the content is right.
 *
 * WHAT IT CANNOT SEE
 *   - Errors that only happen on INTERACTION. It loads, waits 450ms, measures.
 *     A Play button that throws on click is invisible here; feature work has
 *     used throwaway Playwright scripts for that.
 *   - Text clipped inside a non-scrolling box is REPORTED SEPARATELY, never a
 *     failure: ~450 pages carry hand-written per-page CSS and failing on all
 *     of them would make the report noise people skip.
 *   - CDN loads in a sandbox with no network fail on EVERY page. Those are
 *     filed under "network only" and shown, not counted — so a genuinely
 *     broken CDN URL also lands in that pile. Check it by hand when a run is
 *     offline.
 *   - Anything about legibility (tmp_contrast.mjs), anything at widths it was
 *     not run at, and the wrong-track-palette clone (nothing sees that).
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 */
async function run(list) {
  for (const f of list) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 500 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 120)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    try {
      await page.goto(`http://127.0.0.1:${port}/${f}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(450);
      const m = await page.evaluate(() => {
        /* Page-level overflow is only half the story. A card whose content is
           125px too wide CLIPS internally — the reader loses the end of the
           sentence — while documentElement.scrollWidth stays exactly equal to
           clientWidth, so the page reports clean. That is how kit cards shipped
           with truncated code tokens on several authored pages. Measure the
           elements too: content wider than its box, in a box that does not
           scroll, is content nobody can read.

           Deliberately ignores anything with overflow-x auto/scroll (a <pre> or
           a wide table is SUPPOSED to scroll itself) and anything clipped by
           less than 4px, which is rounding rather than a defect. */
        const clipped = [];
        for (const el of document.querySelectorAll('body *')) {
          if (el.scrollWidth <= el.clientWidth + 4) continue;
          if (!el.clientWidth) continue;                       // not laid out
          /* Only elements that OWN the text. scrollWidth propagates up the
             ancestor chain, so a single wide <pre> makes its container, its
             section and its body all look guilty; flagging all of them buries
             the one element actually losing a word. A direct text child is what
             distinguishes "this box clips its own sentence" from "something
             inside me is wide". */
          let ownsText = false;
          for (const n of el.childNodes)
            if (n.nodeType === 3 && n.textContent.trim()) { ownsText = true; break; }
          if (!ownsText) continue;
          const st = getComputedStyle(el);
          if (/auto|scroll/.test(st.overflowX)) continue;      // scrolls on purpose
          if (st.position === 'absolute' || st.position === 'fixed') continue;
          if (st.whiteSpace === 'pre' || st.whiteSpace === 'nowrap') continue;  // opted out of wrapping
          if (st.textOverflow === 'ellipsis') continue;        // truncation on purpose
          clipped.push(el.tagName.toLowerCase() +
            (typeof el.className === 'string' && el.className
              ? '.' + el.className.trim().split(/\s+/)[0] : '') +
            ' +' + (el.scrollWidth - el.clientWidth) + 'px');
        }
        /* Render-blocking external resources in <head> are flagged as REAL
           problems even when the fetch succeeds (or fails as netOnly). Lesson
           learned from angular-material-cdk: its Google Fonts <link> failure
           filed under "expected in a sandbox" and the page printed clean —
           while for a real learner on a slow/blocked host it was a solid dark
           rectangle for 13 seconds (FCP 13,112ms vs a 312ms site median),
           because rendering WAITS on a head stylesheet. The structure is the
           bug; whether the request happened to succeed today is weather.
           A sync external <script> in <head> blocks the parser the same way,
           so it is flagged too (defer/async/module do not block). */
        const blocking = [];
        for (const l of document.querySelectorAll('head link[rel="stylesheet"]')) {
          if (l.disabled) continue;
          const media = (l.getAttribute('media') || '').trim().toLowerCase();
          if (media && media !== 'all' && media !== 'screen') continue;   // print etc.
          if (/^https?:/.test(l.href) && new URL(l.href).origin !== location.origin)
            blocking.push('link ' + l.href);
        }
        for (const s of document.querySelectorAll('head script[src]')) {
          if (s.defer || s.async || s.type === 'module') continue;
          if (/^https?:/.test(s.src) && new URL(s.src).origin !== location.origin)
            blocking.push('script ' + s.src);
        }
        return {
          overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
          sw: document.documentElement.scrollWidth,
          empty: (document.body.innerText || '').trim().length < 40,
          clipped: clipped.slice(0, 3),
          clippedCount: clipped.length,
          blocking,
        };
      });
      const netOnly = errs.length && errs.every((e) => /ERR_(CONNECTION|TUNNEL|NAME|CERT|ABORTED)|net::/.test(e));
      const issues = [];
      if (errs.length && !netOnly) issues.push(errs.find((e) => !/net::/.test(e)) || errs[0]);
      if (m.overflow) issues.push(`horizontal overflow (${m.sw}px at ${width}px)`);
      if (m.empty) issues.push('rendered almost no text');
      if (m.blocking.length) issues.push(`render-blocking external resource in <head>: ${m.blocking.join(', ')}`);
      /* Clipping is reported SEPARATELY, not as a page failure. The shared
         components are fixed, but ~450 pages carry hand-written per-page CSS
         with its own narrow boxes, and failing the sweep on every one of them
         would make the whole report something people skip. Same reasoning as
         the network-only section below: a gate that cries wolf is a gate that
         gets ignored. */
      if (m.clippedCount) clipping.push([f, m.clippedCount, m.clipped.join(', ')]);
      if (issues.length) real.push([f, issues.join(' | ')]);
      else if (netOnly) network.push([f, errs[0]]);
    } catch (e) {
      real.push([f, 'LOAD FAILED: ' + String(e).slice(0, 90)]);
    }
    await ctx.close();
    if (++done % 100 === 0) console.log(`  …${done}/${pages.length}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) =>
  run(pages.filter((_, j) => j % CONCURRENCY === i))));

await browser.close();
server.close();

if (network.length) {
  console.log(`\nℹ ${network.length} page(s) failed only on OUTBOUND NETWORK — expected in a sandbox:`);
  network.slice(0, 5).forEach(([f]) => console.log(`   ${f}`));
  if (network.length > 5) console.log(`   …and ${network.length - 5} more`);
}

if (real.length) {
  console.error(`\n✗ ${real.length} page(s) with real problems:`);
  real.forEach(([f, i]) => console.error(`   ${f}\n     ${i}`));
  console.error('');
  process.exit(1);
}
if (clipping.length) {
  const totalEls = clipping.reduce((n, c) => n + c[1], 0);
  console.log(`\nℹ ${clipping.length} page(s) clip text inside a non-scrolling box (${totalEls} element(s)).`);
  console.log('   Not a failure: the shared components wrap correctly; these are per-page styles.');
  clipping.sort((a, b) => b[1] - a[1]).slice(0, 8)
    .forEach(([f, n, what]) => console.log(`   ${String(n).padStart(3)}  ${f}  ${what}`));
  if (clipping.length > 8) console.log(`   …and ${clipping.length - 8} more`);
}

console.log(`\n✓ ${pages.length} page(s) clean — no uncaught errors, no overflow, all rendered\n`);
