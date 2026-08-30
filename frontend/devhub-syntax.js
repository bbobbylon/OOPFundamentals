/* ============================================================================
 * devhub-syntax.js — sitewide IDE-style syntax highlighting for static code.
 *
 * WHY: devhub.css has always had a token palette (pre .kw/.str/.cm/.fn/.dec/
 * .num) but only ~158 pages hand-annotate their <pre> blocks with those
 * spans — the other ~1,800 <pre> blocks across the site render as plain
 * white text. This engine closes that gap with zero per-page markup: drop
 * the script tag on a page and every *static, code-looking* <pre> gets the
 * same colors a hand-annotated block has, so the whole site reads like an
 * IDE instead of a typewriter.
 *
 * WHAT IT DELIBERATELY SKIPS (auto mode):
 *   - <pre> with element children  — already hand-highlighted (or carries
 *     intentional markup like .hl/.hlgood diff shading); never re-tokenized.
 *   - <pre> with an id             — those are dynamic panes (rtPayload /
 *     rtHeaders live inspectors, tryit output) that scripts rewrite; racing
 *     them would clobber their content mid-update.
 *   - <pre> inside interactive widgets (.cw, .dlh-tryit, .dlh-cg, quiz/
 *     flashcard roots) — each widget owns its own rendering.
 *   - <pre> that doesn't look like code (ASCII diagrams, file trees, HTTP
 *     dumps) — coloring "Capitalized" words in a box-drawing diagram as Java
 *     types looks broken, so a cheap looks-like-code heuristic gates it.
 *   - Opt-out escape hatch: <pre data-nohl> is never touched.
 *
 * TOKENIZER: same single-pass ordered-alternation design as
 * devhub-codewalk.js's hl() — a comment/string match consumes its region so
 * keywords inside strings are never colored. Kept in sync by hand; if you
 * improve one, improve the other. Classes emitted match devhub.css's
 * existing palette (kw/str/cm/dec/num/fn) plus .type (added to devhub.css
 * with this engine).
 *
 * SELF-CONTAINED: injects its own token colors (id-guarded, mirroring
 * devhub.css exactly) so pages that load this script without devhub.css —
 * the index/landing pages — still get identical colors. Same hard lesson as
 * the .dh-ripple bug: never assume the stylesheet is present.
 *
 * USAGE:  <script src="devhub-syntax.js"></script>   (before </body>)
 * API:    DevHubSyntax.highlight(rawText) -> html string
 *         DevHubSyntax.apply(rootEl?)     -> re-scan (for late-added <pre>)
 * ========================================================================== */
(function (global, doc) {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // One ordered alternation, first match wins per position: comment > string >
  // annotation/decorator > keyword > literal > number > Type > call().
  var KW = 'abstract|class|interface|enum|extends|implements|public|private|protected|static|final|void|return|new|if|else|elif|for|while|do|switch|case|break|continue|default|this|super|import|export|from|const|let|var|function|async|await|try|catch|finally|throw|throws|typeof|instanceof|of|in|is|not|and|or|yield|def|lambda|with|as|pass|raise|record|sealed|permits|synchronized|volatile|transient|native|strictfp|module|requires|readonly|declare|keyof|infer|satisfies|type|namespace|package|fun|val|end|begin|then|elsif|unless|until|require|include|attr_accessor|puts|fn|impl|struct|trait|mut|match|loop|use|mod|pub|crate|where|go|chan|func|defer|range|map|select|SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|UNIQUE|LIMIT|AND|OR|AS|DISTINCT';
  var LIT = 'true|false|null|undefined|None|True|False|nil|self|NaN|Infinity';
  var RE = new RegExp(
    '(\\/\\/[^\\n]*|--[ ][^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|&lt;!--[\\s\\S]*?--&gt;)' + // 1 comment
    '|(\\x22(?:\\\\.|[^\\x22\\\\\\n])*\\x22|\\x27(?:\\\\.|[^\\x27\\\\\\n])*\\x27|`[^`]*`)' + // 2 string
    '|(@[A-Za-z_][A-Za-z0-9_.]*)' +                                                          // 3 annotation/decorator
    '|\\b(' + KW + ')\\b' +                                                                  // 4 keyword
    '|\\b(' + LIT + ')\\b' +                                                                 // 5 literal
    '|\\b(0[xXbB][0-9a-fA-F_]+|\\d[\\d_]*\\.?\\d*(?:[eE][+-]?\\d+)?[fLdn]?)\\b' +            // 6 number
    '|\\b([A-Z][A-Za-z0-9_]*)\\b' +                                                          // 7 Type (Capitalized)
    '|\\b([a-z_$][A-Za-z0-9_$]*)(?=\\s*\\()',                                                // 8 function call
    'g');

  function highlight(raw) {
    return esc(raw).replace(RE, function (m, cm, str, dec, kw, lit, num, type, fn) {
      if (cm != null)   return '<span class="cm">' + cm + '</span>';
      if (str != null)  return '<span class="str">' + str + '</span>';
      if (dec != null)  return '<span class="dec">' + dec + '</span>';
      if (kw != null)   return '<span class="kw">' + kw + '</span>';
      if (lit != null)  return '<span class="num">' + lit + '</span>';
      if (num != null)  return '<span class="num">' + num + '</span>';
      if (type != null) return '<span class="type">' + type + '</span>';
      if (fn != null)   return '<span class="fn">' + fn + '</span>';
      return m;
    });
  }

  // Cheap gate: ASCII diagrams / file trees / plain prose stay uncolored.
  function looksLikeCode(t) {
    if (/[{};]|=>|::|<-|->/.test(t)) return true;
    return /\b(function|def|class|import|export|return|const|let|var|public|private|print|console|puts|SELECT|FROM|npm|mvn|git|curl|docker|kubectl)\b/.test(t);
  }

  var SKIP_INSIDE = '.cw, .dlh-tryit, .cg, .dq, .df, .dnb';

  function apply(root) {
    var pres = (root || doc).querySelectorAll('pre');
    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i];
      if (pre.id) continue;                                  // dynamic pane
      if (pre.hasAttribute('data-nohl')) continue;           // explicit opt-out
      if (pre.hasAttribute('data-hl-done')) continue;        // already processed
      if (pre.children.length) continue;                     // hand-annotated / marked-up
      if (pre.closest && pre.closest(SKIP_INSIDE)) continue; // widget-owned
      var text = pre.textContent;
      if (!text || !text.trim() || !looksLikeCode(text)) continue;
      pre.innerHTML = highlight(text);
      pre.setAttribute('data-hl-done', '');
    }
  }

  // Token colors — exact mirror of devhub.css's palette (plus .type) so
  // hand-annotated and auto-highlighted blocks are indistinguishable, and
  // pages without devhub.css still get full color.
  if (!doc.getElementById('dh-syntax-css')) {
    var css = doc.createElement('style');
    css.id = 'dh-syntax-css';
    css.textContent =
      'pre .kw{color:#c084fc}pre .str{color:#fbbf24}' +
      'pre .cm{color:#64748b;font-style:italic}pre .fn{color:#22d3ee}' +
      'pre .dec{color:#f472b6}pre .num{color:#fb923c}pre .type{color:#5eead4}';
    (doc.head || doc.documentElement).appendChild(css);
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function () { apply(); });
  } else {
    apply();
  }

  global.DevHubSyntax = { highlight: highlight, apply: apply };
})(window, document);
