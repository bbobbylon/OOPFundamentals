/* tmp_coachcheck.mjs — does every "Code With Me" coach entry fire on the
 * mistake it describes, and stay QUIET on a correct solution?
 *
 *   node frontend/tmp_coachcheck.mjs
 *
 * A coach entry is a regex with an opinion. Nothing else in the site can tell
 * whether it is RIGHT: vcheck proves the page parses, codecheck compiles the
 * snippets, and a wrong `match` breaks neither — it just tells a learner their
 * correct code is wrong, which is the one thing CLAUDE.md says never to do.
 * So every entry carries two samples here: code that should trip it, and a
 * correct solution that must not.
 *
 * The bank lives inside each page's inline <script>, so this pulls that block
 * out and runs it in a vm with a stubbed DevHubCodeGrade/document, capturing
 * the bank object. Matching then replays devhub-codegrade.js's real
 * matchCoachEntry() — including the `absent` length gate — so a pass here
 * means the engine behaves the same way in the browser.
 *
 * WHAT IT CANNOT SEE (the valuable half):
 *   - Whether the MESSAGE is true. It checks that the regex fires, not that
 *     the advice attached to it is correct teaching. Read those by hand.
 *   - Any mistake outside the two samples. A pass means "not wrong on these
 *     two", never "right on every solution a learner could type".
 *   - Sequential vs nested loops. A regex genuinely cannot tell them apart, so
 *     NESTED_LOOP-style entries can fire on correct code that happens to use
 *     two loops in a row. Cases that knowingly accept that are marked
 *     `nudge: true` and reported as NUDGE, not hidden as a pass.
 *   - Anything about an exercise with no coach entry at all. Silence is not
 *     coverage: isomorphic-strings and graph-valid-tree are deliberately
 *     un-coached because no honest regex exists for their real bug.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const DIR = 'B:/Documents/Coding/OOPFundamentals/frontend/';
const COACH_ABSENT_MIN_EXTRA = 40; // must track devhub-codegrade.js

function matchCoachEntry(c, code, lang, starterCode) {
  if (c.absent && code.length < starterCode.length + COACH_ABSENT_MIN_EXTRA) return false;
  let re = c.match;
  /* NOT `instanceof RegExp`: the bank is evaluated inside a vm context, so its
     regexes come from that realm and fail the host's instanceof. The engine
     itself has no such problem (page and bank share one realm) — this is a
     harness-only correction, and getting it wrong made 30 entries look dead. */
  const isRe = (v) => Object.prototype.toString.call(v) === '[object RegExp]';
  if (re && !isRe(re)) re = re[lang];
  if (!re) return false;
  const hit = re.test(code);
  return c.absent ? !hit : hit;
}

function loadBank(page) {
  const html = readFileSync(DIR + page, 'utf8');
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const src = blocks.find((b) => b.includes('DevHubCodeGrade.render('));
  if (!src) throw new Error('no render block in ' + page);
  let bank = null;
  const ctx = vm.createContext({
    DevHubCodeGrade: { render: (_el, b) => { bank = b; } },
    document: { getElementById: () => ({}) },
    window: {}, console
  });
  vm.runInContext(src, ctx);
  return bank;
}

/* Test corpus: for each entry, code that SHOULD trip it and code that must not.
 * `lang` picks which per-language regex is exercised. Samples are deliberately
 * long enough to clear the absent-entry length gate. */
const CASES = {
  'practice-arrays-strings.html': {
    'two-sum/nested-loop': { lang: 'javascript',
      bad: 'function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n  return [];\n}',
      good: 'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}' },
    'contains-duplicate/nested-loop': { lang: 'javascript',
      bad: 'function containsDuplicate(nums) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] === nums[j]) return true;\n    }\n  }\n  return false;\n}',
      good: 'function containsDuplicate(nums) {\n  return new Set(nums).size !== nums.length;\n}' },
    'valid-anagram/nested-loop': { lang: 'javascript',
      bad: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  for (let i = 0; i < s.length; i++) {\n    let n = 0;\n    for (let j = 0; j < t.length; j++) if (t[j] === s[i]) n++;\n    if (!n) return false;\n  }\n  return true;\n}',
      good: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let i = 0; i < s.length; i++) {\n    count[s[i]] = (count[s[i]] || 0) + 1;\n    count[t[i]] = (count[t[i]] || 0) - 1;\n  }\n  return Object.values(count).every((v) => v === 0);\n}' },
    'max-profit/nested-loop': { lang: 'javascript',
      bad: 'function maxProfit(prices) {\n  let best = 0;\n  for (let i = 0; i < prices.length; i++) {\n    for (let j = i + 1; j < prices.length; j++) {\n      best = Math.max(best, prices[j] - prices[i]);\n    }\n  }\n  return best;\n}',
      good: 'function maxProfit(prices) {\n  let min = Infinity, best = 0;\n  for (const p of prices) {\n    if (p < min) min = p;\n    else best = Math.max(best, p - min);\n  }\n  return best;\n}' },
    'valid-palindrome/forgot-case-fold': { lang: 'javascript',
      bad: 'function isPalindrome(s) {\n  const cleaned = s.split("").filter((ch) => /[a-zA-Z0-9]/.test(ch)).join("");\n  let i = 0, j = cleaned.length - 1;\n  while (i < j) {\n    if (cleaned[i] !== cleaned[j]) return false;\n    i++; j--;\n  }\n  return true;\n}',
      good: 'function isPalindrome(s) {\n  const cleaned = s.toLowerCase().split("").filter((ch) => /[a-z0-9]/.test(ch)).join("");\n  let i = 0, j = cleaned.length - 1;\n  while (i < j) {\n    if (cleaned[i] !== cleaned[j]) return false;\n    i++; j--;\n  }\n  return true;\n}' },
    'longest-substring/nested-loop': { lang: 'javascript',
      bad: 'function lengthOfLongestSubstring(s) {\n  let best = 0;\n  for (let i = 0; i < s.length; i++) {\n    for (let j = i; j < s.length; j++) {\n      if (new Set(s.slice(i, j + 1)).size === j - i + 1) best = Math.max(best, j - i + 1);\n    }\n  }\n  return best;\n}',
      good: 'function lengthOfLongestSubstring(s) {\n  const seen = new Map();\n  let start = 0, best = 0;\n  for (let i = 0; i < s.length; i++) {\n    const ch = s[i];\n    if (seen.has(ch) && seen.get(ch) >= start) start = seen.get(ch) + 1;\n    seen.set(ch, i);\n    best = Math.max(best, i - start + 1);\n  }\n  return best;\n}' },
    'valid-anagram/nested-loop#sequential': { entry: 'valid-anagram/nested-loop', nudge: true, lang: 'javascript',
      note: 'count-then-compare is CORRECT and still trips NESTED_LOOP — the documented limit',
      bad: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  for (let i = 0; i < s.length; i++) {\n    let n = 0;\n    for (let j = 0; j < t.length; j++) if (t[j] === s[i]) n++;\n    if (!n) return false;\n  }\n  return true;\n}',
      good: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const c = {};\n  for (const ch of s) c[ch] = (c[ch] || 0) + 1;\n  for (const ch of t) {\n    if (!c[ch]) return false;\n    c[ch]--;\n  }\n  return true;\n}' }
  },

  'practice-hashmaps-sets.html': {
    'top-k-frequent/nested-loop': { lang: 'javascript',
      bad: 'function topKFrequent(nums, k) {\n  const out = [];\n  for (let i = 0; i < nums.length; i++) {\n    let n = 0;\n    for (let j = 0; j < nums.length; j++) if (nums[j] === nums[i]) n++;\n    out.push([nums[i], n]);\n  }\n  return out.slice(0, k).map((p) => p[0]);\n}',
      good: 'function topKFrequent(nums, k) {\n  const counts = new Map();\n  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);\n  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map((p) => p[0]);\n}' },
    'first-unique-character/nested-loop': { lang: 'javascript',
      bad: 'function firstUniqChar(s) {\n  for (let i = 0; i < s.length; i++) {\n    let n = 0;\n    for (let j = 0; j < s.length; j++) if (s[j] === s[i]) n++;\n    if (n === 1) return i;\n  }\n  return -1;\n}',
      good: 'function firstUniqChar(s) {\n  for (let i = 0; i < s.length; i++) {\n    if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return i;\n  }\n  return -1;\n}' },
    'subarray-sum-equals-k/forgot-zero-seed': { lang: 'javascript',
      bad: 'function subarraySum(nums, k) {\n  const seen = new Map();\n  let sum = 0, count = 0;\n  for (const n of nums) {\n    sum += n;\n    if (seen.has(sum - k)) count += seen.get(sum - k);\n    seen.set(sum, (seen.get(sum) || 0) + 1);\n  }\n  return count;\n}',
      good: 'function subarraySum(nums, k) {\n  const seen = new Map();\n  seen.set(0, 1);\n  let sum = 0, count = 0;\n  for (const n of nums) {\n    sum += n;\n    if (seen.has(sum - k)) count += seen.get(sum - k);\n    seen.set(sum, (seen.get(sum) || 0) + 1);\n  }\n  return count;\n}' },
    'longest-consecutive-sequence/used-sort': { lang: 'javascript',
      bad: 'function longestConsecutive(nums) {\n  if (!nums.length) return 0;\n  const s = [...new Set(nums)].sort((a, b) => a - b);\n  let best = 1, run = 1;\n  for (let i = 1; i < s.length; i++) {\n    if (s[i] === s[i - 1] + 1) run++; else run = 1;\n    best = Math.max(best, run);\n  }\n  return best;\n}',
      good: 'function longestConsecutive(nums) {\n  const set = new Set(nums);\n  let best = 0;\n  for (const n of set) {\n    if (set.has(n - 1)) continue;\n    let len = 1;\n    while (set.has(n + len)) len++;\n    best = Math.max(best, len);\n  }\n  return best;\n}' },
    'contains-duplicate-ii/nested-loop': { lang: 'javascript',
      bad: 'function containsNearbyDuplicate(nums, k) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] === nums[j] && j - i <= k) return true;\n    }\n  }\n  return false;\n}',
      good: 'function containsNearbyDuplicate(nums, k) {\n  const last = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (last.has(nums[i]) && i - last.get(nums[i]) <= k) return true;\n    last.set(nums[i], i);\n  }\n  return false;\n}' }
  },

  'practice-trees.html': {
        'invert-binary-tree/overwrote-left': { lang: 'javascript',
      bad: 'function invertTree(root) {\n  if (!root) return null;\n  root.left = invertTree(root.right);\n  root.right = invertTree(root.left);\n  return root;\n}',
      good: 'function invertTree(root) {\n  if (!root) return null;\n  const tmp = root.left;\n  root.left = invertTree(root.right);\n  root.right = invertTree(tmp);\n  return root;\n}' },
        'validate-bst/parent-only-check': { lang: 'javascript',
      bad: 'function isValidBST(root) {\n  if (!root) return true;\n  if (root.left && root.left.val >= root.val) return false;\n  if (root.right && root.right.val <= root.val) return false;\n  return isValidBST(root.left) && isValidBST(root.right);\n}',
      good: 'function isValidBST(root, lo = -Infinity, hi = Infinity) {\n  if (!root) return true;\n  if (root.val <= lo || root.val >= hi) return false;\n  return isValidBST(root.left, lo, root.val) && isValidBST(root.right, root.val, hi);\n}' },
    'level-order-traversal/slow-queue': { lang: 'javascript',
      bad: 'function levelOrder(root) {\n  const out = [], q = root ? [root] : [];\n  while (q.length) {\n    const n = q.length, row = [];\n    for (let i = 0; i < n; i++) {\n      const node = q.shift();\n      row.push(node.val);\n      if (node.left) q.push(node.left);\n      if (node.right) q.push(node.right);\n    }\n    out.push(row);\n  }\n  return out;\n}',
      good: 'function levelOrder(root) {\n  const out = [], q = root ? [root] : [];\n  let head = 0;\n  while (head < q.length) {\n    const n = q.length - head, row = [];\n    for (let i = 0; i < n; i++) {\n      const node = q[head++];\n      row.push(node.val);\n      if (node.left) q.push(node.left);\n      if (node.right) q.push(node.right);\n    }\n    out.push(row);\n  }\n  return out;\n}' },
    'lca-of-bst/ignores-bst': { lang: 'javascript',
      bad: 'function lowestCommonAncestor(root, p, q) {\n  if (!root || root === p || root === q) return root;\n  const l = lowestCommonAncestor(root.left, p, q);\n  const r = lowestCommonAncestor(root.right, p, q);\n  return l && r ? root : (l || r);\n}',
      good: 'function lowestCommonAncestor(root, p, q) {\n  while (root) {\n    if (p.val < root.val && q.val < root.val) root = root.left;\n    else if (p.val > root.val && q.val > root.val) root = root.right;\n    else return root;\n  }\n  return null;\n}' }
  },

  'practice-linked-lists.html': {
    'reverse-linked-list/rebuild-via-array': { lang: 'javascript',
      bad: 'function reverseList(head) {\n  const vals = [];\n  for (let c = head; c; c = c.next) vals.push(c.val);\n  let out = null;\n  for (const v of vals) out = { val: v, next: out };\n  return out;\n}',
      good: 'function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const nxt = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}' },
    'merge-two-sorted-lists/sorted-the-merge': { lang: 'python',
      bad: 'def merge_two_lists(a, b):\n    vals = []\n    while a:\n        vals.append(a.val); a = a.next\n    while b:\n        vals.append(b.val); b = b.next\n    vals = sorted(vals)\n    return build(vals)',
      good: 'def merge_two_lists(a, b):\n    dummy = ListNode(0)\n    tail = dummy\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next' },
    'linked-list-cycle/set-of-seen-nodes': { lang: 'javascript',
      bad: 'function hasCycle(head) {\n  const seen = new Set();\n  for (let c = head; c; c = c.next) {\n    if (seen.has(c)) return true;\n    seen.add(c);\n  }\n  return false;\n}',
      good: 'function hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}' },
        'middle-of-linked-list/two-pass': { lang: 'javascript',
      bad: 'function middleNode(head) {\n  let len = 0;\n  for (let c = head; c; c = c.next) len++;\n  let node = head;\n  for (let i = 0; i < Math.floor(len / 2); i++) node = node.next;\n  return node;\n}',
      good: 'function middleNode(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow;\n}' },
    'add-two-numbers/converted-to-int': { lang: 'javascript',
      bad: 'function addTwoNumbers(l1, l2) {\n  let a = "", b = "";\n  for (let c = l1; c; c = c.next) a = c.val + a;\n  for (let c = l2; c; c = c.next) b = c.val + b;\n  const sum = Number(a) + Number(b);\n  return build(String(sum).split("").reverse());\n}',
      good: 'function addTwoNumbers(l1, l2) {\n  const dummy = { val: 0, next: null };\n  let tail = dummy, carry = 0;\n  while (l1 || l2 || carry) {\n    const s = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;\n    carry = Math.floor(s / 10);\n    tail.next = { val: s % 10, next: null };\n    tail = tail.next;\n    if (l1) l1 = l1.next;\n    if (l2) l2 = l2.next;\n  }\n  return dummy.next;\n}' }
  },

  'practice-stacks-queues.html': {
    'valid-parentheses/counting-not-stacking': { lang: 'javascript',
      bad: 'function isValid(s) {\n  let round = 0, square = 0, curly = 0;\n  for (const ch of s) {\n    if (ch === "(") round++;\n    else if (ch === ")") round--;\n    else if (ch === "[") square++;\n    else if (ch === "]") square--;\n  }\n  return round === 0 && square === 0 && curly === 0;\n}',
      good: 'function isValid(s) {\n  const st = [], pairs = { ")": "(", "]": "[", "}": "{" };\n  for (const ch of s) {\n    if (pairs[ch]) { if (st.pop() !== pairs[ch]) return false; }\n    else st.push(ch);\n  }\n  return st.length === 0;\n}' },
    'min-stack/scans-for-min': { lang: 'javascript',
      bad: 'function minStackOps(ops, args) {\n  const st = [], out = [];\n  for (let i = 0; i < ops.length; i++) {\n    if (ops[i] === "push") { st.push(args[i][0]); out.push(null); }\n    else if (ops[i] === "getMin") out.push(Math.min(...st));\n  }\n  return out;\n}',
      good: 'function minStackOps(ops, args) {\n  const st = [], mins = [], out = [];\n  for (let i = 0; i < ops.length; i++) {\n    if (ops[i] === "push") {\n      const v = args[i][0];\n      st.push(v);\n      mins.push(mins.length ? (v < mins[mins.length - 1] ? v : mins[mins.length - 1]) : v);\n      out.push(null);\n    } else if (ops[i] === "getMin") out.push(mins[mins.length - 1]);\n  }\n  return out;\n}' },
    'daily-temperatures/nested-loop': { lang: 'javascript',
      bad: 'function dailyTemperatures(t) {\n  const out = new Array(t.length).fill(0);\n  for (let i = 0; i < t.length; i++) {\n    for (let j = i + 1; j < t.length; j++) {\n      if (t[j] > t[i]) { out[i] = j - i; break; }\n    }\n  }\n  return out;\n}',
      good: 'function dailyTemperatures(t) {\n  const out = new Array(t.length).fill(0), st = [];\n  for (let i = 0; i < t.length; i++) {\n    while (st.length && t[i] > t[st[st.length - 1]]) {\n      const j = st.pop();\n      out[j] = i - j;\n    }\n    st.push(i);\n  }\n  return out;\n}' },
    'evaluate-rpn/floor-vs-truncate': { lang: 'python',
      bad: 'def eval_rpn(tokens):\n    st = []\n    for t in tokens:\n        if t == "/":\n            b = st.pop(); a = st.pop(); st.append(a // b)\n        else:\n            st.append(int(t))\n    return st[0]',
      good: 'def eval_rpn(tokens):\n    st = []\n    for t in tokens:\n        if t == "/":\n            b = st.pop(); a = st.pop(); st.append(int(a / b))\n        else:\n            st.append(int(t))\n    return st[0]' },
    'queue-using-stacks/used-a-real-queue': { lang: 'python',
      bad: 'def queue_using_stacks_ops(ops, args):\n    from collections import deque\n    q = deque()\n    out = []\n    for i, op in enumerate(ops):\n        if op == "push":\n            q.append(args[i][0]); out.append(None)\n    return out',
      good: 'def queue_using_stacks_ops(ops, args):\n    inbox, outbox, out = [], [], []\n    for i, op in enumerate(ops):\n        if op == "push":\n            inbox.append(args[i][0]); out.append(None)\n        else:\n            if not outbox:\n                while inbox:\n                    outbox.append(inbox.pop())\n            out.append(outbox.pop())\n    return out' },
    'sliding-window-maximum/max-per-window': { lang: 'javascript',
      bad: 'function maxSlidingWindow(nums, k) {\n  const out = [];\n  for (let i = 0; i + k <= nums.length; i++) {\n    out.push(Math.max(...nums.slice(i, i + k)));\n  }\n  return out;\n}',
      good: 'function maxSlidingWindow(nums, k) {\n  const out = [], dq = [];\n  let head = 0;\n  for (let i = 0; i < nums.length; i++) {\n    while (dq.length > head && dq[head] <= i - k) head++;\n    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();\n    dq.push(i);\n    if (i >= k - 1) out.push(nums[dq[head]]);\n  }\n  return out;\n}' }
  },

  'practice-graphs.html': {
    'number-of-islands/never-marks-visited': { lang: 'javascript',
      bad: 'function numIslands(grid) {\n  let count = 0;\n  const dfs = (r, c) => {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;\n    if (grid[r][c] !== "1") return;\n    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n  };\n  for (let r = 0; r < grid.length; r++)\n    for (let c = 0; c < grid[0].length; c++)\n      if (grid[r][c] === "1") { count++; dfs(r, c); }\n  return count;\n}',
      good: 'function numIslands(grid) {\n  let count = 0;\n  const dfs = (r, c) => {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;\n    if (grid[r][c] !== "1") return;\n    grid[r][c] = "0";\n    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n  };\n  for (let r = 0; r < grid.length; r++)\n    for (let c = 0; c < grid[0].length; c++)\n      if (grid[r][c] === "1") { count++; dfs(r, c); }\n  return count;\n}' },
    'course-schedule/visited-only': { lang: 'javascript',
      bad: 'function canFinish(n, prereqs) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [a, b] of prereqs) adj[b].push(a);\n  const visited = new Set();\n  const dfs = (u) => {\n    if (visited.has(u)) return false;\n    visited.add(u);\n    for (const v of adj[u]) if (!dfs(v)) return false;\n    return true;\n  };\n  for (let i = 0; i < n; i++) if (!dfs(i)) return false;\n  return true;\n}',
      good: 'function canFinish(n, prereqs) {\n  const adj = Array.from({ length: n }, () => []);\n  const indegree = new Array(n).fill(0);\n  for (const [a, b] of prereqs) { adj[b].push(a); indegree[a]++; }\n  const q = [];\n  for (let i = 0; i < n; i++) if (!indegree[i]) q.push(i);\n  let done = 0;\n  for (let h = 0; h < q.length; h++) {\n    done++;\n    for (const v of adj[q[h]]) if (--indegree[v] === 0) q.push(v);\n  }\n  return done === n;\n}' },
    'connected-components/no-path-compression': { lang: 'javascript',
      bad: 'function countComponents(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  function find(x) {\n    while (parent[x] !== x) x = parent[x];\n    return x;\n  }\n  let count = n;\n  for (const [a, b] of edges) {\n    const ra = find(a), rb = find(b);\n    if (ra !== rb) { parent[ra] = rb; count--; }\n  }\n  return count;\n}',
      good: 'function countComponents(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const rank = new Array(n).fill(0);\n  function find(x) {\n    if (parent[x] !== x) parent[x] = find(parent[x]);\n    return parent[x];\n  }\n  let count = n;\n  for (const [a, b] of edges) {\n    const ra = find(a), rb = find(b);\n    if (ra !== rb) { parent[ra] = rb; count--; }\n  }\n  return count;\n}' },
    'rotting-oranges/forgot-impossible': { lang: 'javascript',
      bad: 'function orangesRotting(grid) {\n  const q = [];\n  let minutes = 0;\n  for (let r = 0; r < grid.length; r++)\n    for (let c = 0; c < grid[0].length; c++)\n      if (grid[r][c] === 2) q.push([r, c]);\n  while (q.length) { minutes++; }\n  return minutes;\n}',
      good: 'function orangesRotting(grid) {\n  const q = [];\n  let fresh = 0, minutes = 0;\n  for (let r = 0; r < grid.length; r++)\n    for (let c = 0; c < grid[0].length; c++) {\n      if (grid[r][c] === 2) q.push([r, c]);\n      else if (grid[r][c] === 1) fresh++;\n    }\n  while (q.length && fresh) { minutes++; }\n  return fresh > 0 ? -1 : minutes;\n}' },
    'is-graph-bipartite/single-source': { lang: 'javascript',
      bad: 'function isBipartite(graph) {\n  const color = new Array(graph.length).fill(-1);\n  const queue = [0];\n  color[0] = 0;\n  while (queue.length) {\n    const u = queue.shift();\n    for (const v of graph[u]) {\n      if (color[v] === -1) { color[v] = 1 - color[u]; queue.push(v); }\n      else if (color[v] === color[u]) return false;\n    }\n  }\n  return true;\n}',
      good: 'function isBipartite(graph) {\n  const color = new Array(graph.length).fill(-1);\n  for (let s = 0; s < graph.length; s++) {\n    if (color[s] !== -1) continue;\n    color[s] = 0;\n    const queue = [s];\n    for (let h = 0; h < queue.length; h++) {\n      const u = queue[h];\n      for (const v of graph[u]) {\n        if (color[v] === -1) { color[v] = 1 - color[u]; queue.push(v); }\n        else if (color[v] === color[u]) return false;\n      }\n    }\n  }\n  return true;\n}' }
  },

  'practice-dynamic-programming.html': {
    'climbing-stairs/unmemoised-recursion': { lang: 'javascript',
      bad: 'function climbStairs(n) {\n  if (n <= 2) return n;\n  return climbStairs(n - 1) + climbStairs(n - 2);\n}',
      good: 'function climbStairs(n) {\n  let a = 1, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}' },
    'house-robber/alternating-greedy': { lang: 'javascript',
      bad: 'function rob(nums) {\n  let even = 0, odd = 0;\n  for (let i = 0; i < nums.length; i += 2) even += nums[i];\n  for (let i = 1; i < nums.length; i += 2) odd += nums[i];\n  return Math.max(even, odd);\n}',
      good: 'function rob(nums) {\n  let prev = 0, curr = 0;\n  for (const n of nums) {\n    const take = prev + n;\n    prev = curr;\n    curr = Math.max(curr, take);\n  }\n  return curr;\n}' },
    'coin-change/greedy-largest-first': { lang: 'javascript',
      bad: 'function coinChange(coins, amount) {\n  coins.sort((a, b) => b - a);\n  let count = 0;\n  for (const c of coins) {\n    while (amount >= c) { amount -= c; count++; }\n  }\n  return amount === 0 ? count : -1;\n}',
      good: 'function coinChange(coins, amount) {\n  const best = new Array(amount + 1).fill(Infinity);\n  best[0] = 0;\n  for (let a = 1; a <= amount; a++)\n    for (const c of coins)\n      if (c <= a) best[a] = Math.min(best[a], best[a - c] + 1);\n  return best[amount] === Infinity ? -1 : best[amount];\n}' },
    'longest-increasing-subsequence/n-squared-is-fine': { lang: 'javascript',
      bad: 'function lengthOfLIS(nums) {\n  const dp = new Array(nums.length).fill(1);\n  for (let i = 1; i < nums.length; i++)\n    for (let j = 0; j < i; j++)\n      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n  return Math.max(...dp, 0);\n}',
      good: 'function lengthOfLIS(nums) {\n  const tails = [];\n  for (const n of nums) {\n    let lo = 0, hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < n) lo = mid + 1; else hi = mid;\n    }\n    tails[lo] = n;\n  }\n  return tails.length;\n}' },
    'max-subarray/nested-loop': { lang: 'javascript',
      bad: 'function maxSubArray(nums) {\n  let best = -Infinity;\n  for (let i = 0; i < nums.length; i++) {\n    let sum = 0;\n    for (let j = i; j < nums.length; j++) { sum += nums[j]; best = Math.max(best, sum); }\n  }\n  return best;\n}',
      good: 'function maxSubArray(nums) {\n  let curr = nums[0], best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    best = Math.max(best, curr);\n  }\n  return best;\n}' },
    'unique-paths/unmemoised-recursion': { lang: 'javascript',
      bad: 'function uniquePaths(m, n) {\n  if (m === 1 || n === 1) return 1;\n  return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);\n}',
      good: 'function uniquePaths(m, n) {\n  const row = new Array(n).fill(1);\n  for (let r = 1; r < m; r++)\n    for (let c = 1; c < n; c++)\n      row[c] += row[c - 1];\n  return row[n - 1];\n}' }
  },

  'practice-sorting-searching.html': {
    'binary-search/used-a-builtin': { lang: 'javascript',
      bad: 'function binarySearch(nums, target) {\n  return nums.indexOf(target);\n}',
      good: 'function binarySearch(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}' },
    'merge-sorted-arrays/concat-and-sort': { lang: 'javascript',
      bad: 'function mergeSorted(a, b) {\n  return a.concat(b).sort((x, y) => x - y);\n}',
      good: 'function mergeSorted(a, b) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);\n  while (i < a.length) out.push(a[i++]);\n  while (j < b.length) out.push(b[j++]);\n  return out;\n}' },
    'find-min-rotated/linear-min': { lang: 'javascript',
      bad: 'function findMin(nums) {\n  return Math.min(...nums);\n}',
      good: 'function findMin(nums) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;\n  }\n  return nums[lo];\n}' },
    'search-rotated/used-a-builtin': { lang: 'javascript',
      bad: 'function search(nums, target) {\n  return nums.indexOf(target);\n}',
      good: 'function search(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] === target) return mid;\n    if (nums[lo] <= nums[mid]) {\n      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;\n    } else {\n      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;\n    }\n  }\n  return -1;\n}' },
    'kth-largest/sort-everything': { lang: 'javascript',
      bad: 'function findKthLargest(nums, k) {\n  const s = nums.slice().sort((a, b) => b - a);\n  return s[k - 1];\n}',
      good: 'function findKthLargest(nums, k) {\n  const heap = [];\n  for (const n of nums) {\n    heap.push(n);\n    heap.sort;\n  }\n  return quickselect(nums, nums.length - k);\n}'.replace('heap.sort;', 'if (heap.length > k) heap.shift();') },
    'merge-intervals/forgot-to-sort': { lang: 'javascript',
      bad: 'function mergeIntervals(intervals) {\n  const out = [];\n  for (const iv of intervals) {\n    const last = out[out.length - 1];\n    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);\n    else out.push(iv.slice());\n  }\n  return out;\n}',
      good: 'function mergeIntervals(intervals) {\n  const xs = intervals.slice().sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const iv of xs) {\n    const last = out[out.length - 1];\n    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);\n    else out.push(iv.slice());\n  }\n  return out;\n}' }
  },

  'practice-backtracking.html': {
    'subsets/pushed-the-reference': { lang: 'javascript',
      bad: 'function subsets(nums) {\n  const out = [], curr = [];\n  const go = (i) => {\n    if (i === nums.length) { out.push(curr); return; }\n    go(i + 1);\n    curr.push(nums[i]);\n    go(i + 1);\n    curr.pop();\n  };\n  go(0);\n  return out;\n}',
      good: 'function subsets(nums) {\n  const out = [], curr = [];\n  const go = (i) => {\n    if (i === nums.length) { out.push([...curr]); return; }\n    go(i + 1);\n    curr.push(nums[i]);\n    go(i + 1);\n    curr.pop();\n  };\n  go(0);\n  return out;\n}' },
    'combinations/pushed-the-reference': { lang: 'python',
      bad: 'def combine(n, k):\n    out, curr = [], []\n    def go(start):\n        if len(curr) == k:\n            out.append(curr)\n            return\n        for x in range(start, n + 1):\n            curr.append(x)\n            go(x + 1)\n            curr.pop()\n    go(1)\n    return out',
      good: 'def combine(n, k):\n    out, curr = [], []\n    def go(start):\n        if len(curr) == k:\n            out.append(curr[:])\n            return\n        for x in range(start, n + 1):\n            curr.append(x)\n            go(x + 1)\n            curr.pop()\n    go(1)\n    return out' },
    'permutations/pushed-the-reference': { lang: 'java',
      bad: 'class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> out = new ArrayList<>();\n        List<Integer> curr = new ArrayList<>();\n        boolean[] used = new boolean[nums.length];\n        go(nums, used, curr, out);\n        return out;\n    }\n    void go(int[] nums, boolean[] used, List<Integer> curr, List<List<Integer>> out) {\n        if (curr.size() == nums.length) { out.add(curr); return; }\n    }\n}',
      good: 'class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> out = new ArrayList<>();\n        List<Integer> curr = new ArrayList<>();\n        boolean[] used = new boolean[nums.length];\n        go(nums, used, curr, out);\n        return out;\n    }\n    void go(int[] nums, boolean[] used, List<Integer> curr, List<List<Integer>> out) {\n        if (curr.size() == nums.length) { out.add(new ArrayList<>(curr)); return; }\n    }\n}' },
    'letter-combinations-phone-number/empty-input': { lang: 'javascript',
      bad: 'function letterCombinations(digits) {\n  const map = { 2: "abc", 3: "def" };\n  const out = [];\n  const go = (i, path) => {\n    if (i === digits.length) { out.push(path); return; }\n    for (const ch of map[digits[i]]) go(i + 1, path + ch);\n  };\n  go(0, "");\n  return out;\n}',
      good: 'function letterCombinations(digits) {\n  if (!digits) return [];\n  const map = { 2: "abc", 3: "def" };\n  const out = [];\n  const go = (i, path) => {\n    if (i === digits.length) { out.push(path); return; }\n    for (const ch of map[digits[i]]) go(i + 1, path + ch);\n  };\n  go(0, "");\n  return out;\n}' },
    'word-search/forgot-the-undo': { lang: 'javascript',
      bad: 'function exist(board, word) {\n  const go = (r, c, i) => {\n    if (i === word.length) return true;\n    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) return false;\n    if (board[r][c] !== word[i]) return false;\n    board[r][c] = "#";\n    return go(r + 1, c, i + 1) || go(r - 1, c, i + 1) || go(r, c + 1, i + 1) || go(r, c - 1, i + 1);\n  };\n  return go(0, 0, 0);\n}',
      good: 'function exist(board, word) {\n  const go = (r, c, i) => {\n    if (i === word.length) return true;\n    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) return false;\n    if (board[r][c] !== word[i]) return false;\n    const ch = board[r][c];\n    board[r][c] = "#";\n    const hit = go(r + 1, c, i + 1) || go(r - 1, c, i + 1) || go(r, c + 1, i + 1) || go(r, c - 1, i + 1);\n    board[r][c] = ch;\n    return hit;\n  };\n  return go(0, 0, 0);\n}' },
    'n-queens-count/building-boards': { lang: 'javascript',
      bad: 'function totalNQueens(n) {\n  const board = Array.from({ length: n }, () => ".".repeat(n).split(""));\n  let count = 0;\n  const go = (r) => {\n    if (r === n) { count++; return; }\n    for (let c = 0; c < n; c++) {\n      board[r][c] = "Q";\n      go(r + 1);\n      board[r][c] = ".";\n    }\n  };\n  go(0);\n  return count;\n}',
      good: 'function totalNQueens(n) {\n  const cols = new Set(), d1 = new Set(), d2 = new Set();\n  let count = 0;\n  const go = (r) => {\n    if (r === n) { count++; return; }\n    for (let c = 0; c < n; c++) {\n      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;\n      cols.add(c); d1.add(r - c); d2.add(r + c);\n      go(r + 1);\n      cols.delete(c); d1.delete(r - c); d2.delete(r + c);\n    }\n  };\n  go(0);\n  return count;\n}' }
  }
};

let pass = 0, fail = 0, missing = 0, nudge = 0;
for (const [page, cases] of Object.entries(CASES)) {
  const bank = loadBank(page);
  const byId = Object.fromEntries(bank.exercises.map((e) => [e.id, e]));
  console.log('\n' + page);
  for (const [key, spec] of Object.entries(cases)) {
    const [exid, entryId] = (spec.entry || key).split('/');
    const ex = byId[exid];
    const entry = (ex.coach || []).find((c) => c.id === entryId);
    if (!entry) { console.log(`  ?? ${key} — no such coach entry`); missing++; continue; }
    const starter = ex.starter[spec.lang] || '';
    const gate = entry.absent && spec.bad.length < starter.length + COACH_ABSENT_MIN_EXTRA;
    const firedBad = matchCoachEntry(entry, spec.bad, spec.lang, starter);
    const firedGood = matchCoachEntry(entry, spec.good, spec.lang, starter);
    const ok = firedBad && !firedGood;
    const nudged = spec.nudge && firedBad && firedGood;
    if (ok) pass++; else if (nudged) nudge++; else fail++;
    console.log(`  ${ok ? 'OK  ' : nudged ? 'NUDGE' : 'FAIL'} ${key.padEnd(52)} bad=${firedBad ? 'fires' : 'quiet'} good=${firedGood ? 'FIRES' : 'quiet'}${gate ? '  [absent gate: sample only ' + (spec.bad.length - starter.length) + ' chars past starter]' : ''}${spec.note ? '  \u2014 ' + spec.note : ''}`);
  }
  /* every authored entry must appear in the corpus */
  for (const ex of bank.exercises)
    for (const c of ex.coach || [])
      if (!cases[`${ex.id}/${c.id}`]) { console.log(`  ?? untested entry ${ex.id}/${c.id}`); missing++; }
}
console.log(`\n${pass} passed, ${nudge} nudge (fires on correct code too, by design), `
  + `${fail} failed, ${missing} untested/missing`);
process.exit(fail || missing ? 1 : 0);
