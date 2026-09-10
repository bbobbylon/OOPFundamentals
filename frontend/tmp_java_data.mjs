/* ============================================================================
 * tmp_java_data.mjs — the Java layer for every coding-practice exercise:
 * display signature, starter code, functionName, javaTypes, and a REFERENCE
 * SOLUTION used only by tmp_java_verify.mjs (never shipped to a page).
 *
 * WHAT IT IS
 *   Pure data, no logic — one entry per exercise id, keyed the same as the
 *   exercise banks the practice pages load. It is the ONLY place the Java
 *   half of an exercise is written down; the pages get their starter/signature
 *   from here via the tmp_add_java.mjs codemod, and the graders get the
 *   reference solution from here too.
 *
 * HOW TO RUN
 *   Not runnable. It is imported:
 *     tmp_java_verify.mjs   compiles every `sol` with the local javac
 *     tmp_add_java.mjs      splices `starter`/`fn`/`types` into the pages
 *
 * WHAT A FAILURE MEANS
 *   Nothing fails HERE — failures surface in tmp_java_verify.mjs, which is the
 *   point: this file is the gold standard, so a bad entry looks like a broken
 *   grader. Suspect this file first when one exercise fails and its neighbours
 *   pass.
 *
 * WHAT IT CANNOT SEE
 *   That an entry matches the exercise the PAGE actually shows. The id is the
 *   only link, so a starter here can drift from the prompt on the page and
 *   nothing notices — the code still compiles, it just solves a different
 *   problem than the one the learner is reading.
 *   The reference solutions are not proof of a good exercise either: `sol` is
 *   verified to PASS the tests, never to be idiomatic, optimal, or the
 *   approach the lesson just taught.
 *   And the `// ListNode is provided` preambles are plain strings — nothing
 *   checks they still match the harness that really injects those classes.
 * ========================================================================== */

const U = 'import java.util.*;\n\n';
const LN = '// ListNode is provided (do NOT redeclare it):\n// class ListNode { int val; ListNode next; ListNode(int val) { this.val = val; } }\n';
const TN = '// TreeNode is provided (do NOT redeclare it):\n// class TreeNode { int val; TreeNode left, right; TreeNode(int val) { this.val = val; } }\n';

export const JAVA = {

/* ================= arrays & strings ================= */
'two-sum': {
  fn: 'twoSum', types: ['int[]', 'int'],
  sig: 'public int[] twoSum(int[] nums, int target)',
  starter: U + `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // your code here
        return new int[0];
    }
}`,
  ref: U + `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.containsKey(target - nums[i])) return new int[]{seen.get(target - nums[i]), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`},

'contains-duplicate': {
  fn: 'containsDuplicate', types: ['int[]'],
  sig: 'public boolean containsDuplicate(int[] nums)',
  starter: U + `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int n : nums) if (!seen.add(n)) return true;
        return false;
    }
}`},

'valid-anagram': {
  fn: 'isAnagram', types: ['String', 'String'],
  sig: 'public boolean isAnagram(String s, String t)',
  starter: U + `class Solution {
    public boolean isAnagram(String s, String t) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.merge(c, 1, Integer::sum);
        for (char c : t.toCharArray()) {
            Integer n = counts.get(c);
            if (n == null || n == 0) return false;
            counts.put(c, n - 1);
        }
        return true;
    }
}`},

'max-profit': {
  fn: 'maxProfit', types: ['int[]'],
  sig: 'public int maxProfit(int[] prices)',
  starter: U + `class Solution {
    public int maxProfit(int[] prices) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int maxProfit(int[] prices) {
        int min = Integer.MAX_VALUE, best = 0;
        for (int p : prices) {
            if (p < min) min = p;
            else if (p - min > best) best = p - min;
        }
        return best;
    }
}`},

'valid-palindrome': {
  fn: 'isPalindrome', types: ['String'],
  sig: 'public boolean isPalindrome(String s)',
  starter: U + `class Solution {
    public boolean isPalindrome(String s) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
            i++; j--;
        }
        return true;
    }
}`},

'longest-substring': {
  fn: 'lengthOfLongestSubstring', types: ['String'],
  sig: 'public int lengthOfLongestSubstring(String s)',
  starter: U + `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int best = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (last.containsKey(c) && last.get(c) >= start) start = last.get(c) + 1;
            last.put(c, i);
            best = Math.max(best, i - start + 1);
        }
        return best;
    }
}`},

/* ================= stacks & queues ================= */
'valid-parentheses': {
  fn: 'isValid', types: ['String'],
  sig: 'public boolean isValid(String s)',
  starter: U + `class Solution {
    public boolean isValid(String s) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`},

'min-stack': {
  fn: 'minStackOps', types: ['String[]', 'int[][]'],
  sig: 'public List<Object> minStackOps(String[] ops, int[][] argsList)',
  starter: U + `class Solution {
    public List<Object> minStackOps(String[] ops, int[][] argsList) {
        Deque<Integer> stack = new ArrayDeque<>();
        Deque<Integer> minStack = new ArrayDeque<>();
        List<Object> results = new ArrayList<>();
        for (int i = 0; i < ops.length; i++) {
            String op = ops[i];
            int[] opArgs = argsList[i];
            // your code here — handle "push", "pop", "top", "getMin"
        }
        return results;
    }
}`,
  ref: U + `class Solution {
    public List<Object> minStackOps(String[] ops, int[][] argsList) {
        Deque<Integer> stack = new ArrayDeque<>();
        Deque<Integer> minStack = new ArrayDeque<>();
        List<Object> results = new ArrayList<>();
        for (int i = 0; i < ops.length; i++) {
            String op = ops[i];
            int[] opArgs = argsList[i];
            if (op.equals("push")) {
                stack.push(opArgs[0]);
                minStack.push(minStack.isEmpty() ? opArgs[0] : Math.min(minStack.peek(), opArgs[0]));
                results.add(null);
            } else if (op.equals("pop")) {
                stack.pop(); minStack.pop();
                results.add(null);
            } else if (op.equals("top")) {
                results.add(stack.peek());
            } else {
                results.add(minStack.peek());
            }
        }
        return results;
    }
}`},

'daily-temperatures': {
  fn: 'dailyTemperatures', types: ['int[]'],
  sig: 'public int[] dailyTemperatures(int[] temperatures)',
  starter: U + `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        // your code here
        return new int[0];
    }
}`,
  ref: U + `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] out = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int j = stack.pop();
                out[j] = i - j;
            }
            stack.push(i);
        }
        return out;
    }
}`},

'evaluate-rpn': {
  fn: 'evalRPN', types: ['String[]'],
  sig: 'public int evalRPN(String[] tokens)',
  starter: U + `class Solution {
    public int evalRPN(String[] tokens) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String t : tokens) {
            if (t.equals("+") || t.equals("-") || t.equals("*") || t.equals("/")) {
                int b = stack.pop(), a = stack.pop();
                int r = t.equals("+") ? a + b : t.equals("-") ? a - b : t.equals("*") ? a * b : a / b;
                stack.push(r);
            } else {
                stack.push(Integer.parseInt(t));
            }
        }
        return stack.pop();
    }
}`},

'queue-using-stacks': {
  fn: 'queueUsingStacksOps', types: ['String[]', 'int[][]'],
  sig: 'public List<Object> queueUsingStacksOps(String[] ops, int[][] argsList)',
  starter: U + `class Solution {
    public List<Object> queueUsingStacksOps(String[] ops, int[][] argsList) {
        Deque<Integer> inStack = new ArrayDeque<>();
        Deque<Integer> outStack = new ArrayDeque<>();
        List<Object> results = new ArrayList<>();
        for (int i = 0; i < ops.length; i++) {
            String op = ops[i];
            int[] opArgs = argsList[i];
            // your code here — handle "push", "pop", "peek", "empty"
        }
        return results;
    }
}`,
  ref: U + `class Solution {
    public List<Object> queueUsingStacksOps(String[] ops, int[][] argsList) {
        Deque<Integer> inStack = new ArrayDeque<>();
        Deque<Integer> outStack = new ArrayDeque<>();
        List<Object> results = new ArrayList<>();
        for (int i = 0; i < ops.length; i++) {
            String op = ops[i];
            int[] opArgs = argsList[i];
            if (op.equals("push")) { inStack.push(opArgs[0]); results.add(null); continue; }
            if (outStack.isEmpty()) while (!inStack.isEmpty()) outStack.push(inStack.pop());
            if (op.equals("pop")) results.add(outStack.pop());
            else if (op.equals("peek")) results.add(outStack.peek());
            else results.add(inStack.isEmpty() && outStack.isEmpty());
        }
        return results;
    }
}`},

'sliding-window-maximum': {
  fn: 'maxSlidingWindow', types: ['int[]', 'int'],
  sig: 'public int[] maxSlidingWindow(int[] nums, int k)',
  starter: U + `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        // your code here
        return new int[0];
    }
}`,
  ref: U + `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] out = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.addLast(i);
            if (i >= k - 1) out[i - k + 1] = nums[dq.peekFirst()];
        }
        return out;
    }
}`},

/* ================= sorting & searching ================= */
'binary-search': {
  fn: 'search', types: ['int[]', 'int'],
  sig: 'public int search(int[] nums, int target)',
  starter: U + `class Solution {
    public int search(int[] nums, int target) {
        // your code here
        return -1;
    }
}`,
  ref: U + `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
}`},

'merge-sorted-arrays': {
  fn: 'mergeSortedArrays', types: ['int[]', 'int[]'],
  sig: 'public int[] mergeSortedArrays(int[] nums1, int[] nums2)',
  starter: U + `class Solution {
    public int[] mergeSortedArrays(int[] nums1, int[] nums2) {
        // your code here
        return new int[0];
    }
}`,
  ref: U + `class Solution {
    public int[] mergeSortedArrays(int[] nums1, int[] nums2) {
        int[] out = new int[nums1.length + nums2.length];
        int i = 0, j = 0, k = 0;
        while (i < nums1.length && j < nums2.length)
            out[k++] = nums1[i] <= nums2[j] ? nums1[i++] : nums2[j++];
        while (i < nums1.length) out[k++] = nums1[i++];
        while (j < nums2.length) out[k++] = nums2[j++];
        return out;
    }
}`},

'find-min-rotated': {
  fn: 'findMin', types: ['int[]'],
  sig: 'public int findMin(int[] nums)',
  starter: U + `class Solution {
    public int findMin(int[] nums) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int findMin(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
        }
        return nums[lo];
    }
}`},

'search-rotated': {
  fn: 'searchRotated', types: ['int[]', 'int'],
  sig: 'public int searchRotated(int[] nums, int target)',
  starter: U + `class Solution {
    public int searchRotated(int[] nums, int target) {
        // your code here
        return -1;
    }
}`,
  ref: U + `class Solution {
    public int searchRotated(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }
}`},

'kth-largest': {
  fn: 'findKthLargest', types: ['int[]', 'int'],
  sig: 'public int findKthLargest(int[] nums, int k)',
  starter: U + `class Solution {
    public int findKthLargest(int[] nums, int k) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int findKthLargest(int[] nums, int k) {
        int[] a = nums.clone();
        Arrays.sort(a);
        return a[a.length - k];
    }
}`},

'merge-intervals': {
  fn: 'mergeIntervals', types: ['int[][]'],
  sig: 'public int[][] mergeIntervals(int[][] intervals)',
  starter: U + `class Solution {
    public int[][] mergeIntervals(int[][] intervals) {
        // your code here
        return new int[0][];
    }
}`,
  ref: U + `class Solution {
    public int[][] mergeIntervals(int[][] intervals) {
        int[][] a = intervals.clone();
        Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] cur : a) {
            if (!out.isEmpty() && cur[0] <= out.get(out.size() - 1)[1])
                out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], cur[1]);
            else out.add(new int[]{cur[0], cur[1]});
        }
        return out.toArray(new int[0][]);
    }
}`},

/* ================= dynamic programming ================= */
'climbing-stairs': {
  fn: 'climbStairs', types: ['int'],
  sig: 'public int climbStairs(int n)',
  starter: U + `class Solution {
    public int climbStairs(int n) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int climbStairs(int n) {
        int a = 1, b = 1;
        for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
        return b;
    }
}`},

'house-robber': {
  fn: 'rob', types: ['int[]'],
  sig: 'public int rob(int[] nums)',
  starter: U + `class Solution {
    public int rob(int[] nums) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int rob(int[] nums) {
        int take = 0, skip = 0;
        for (int n : nums) { int newTake = skip + n; skip = Math.max(skip, take); take = newTake; }
        return Math.max(take, skip);
    }
}`},

'coin-change': {
  fn: 'coinChange', types: ['int[]', 'int'],
  sig: 'public int coinChange(int[] coins, int amount)',
  starter: U + `class Solution {
    public int coinChange(int[] coins, int amount) {
        // your code here
        return -1;
    }
}`,
  ref: U + `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`},

'longest-increasing-subsequence': {
  fn: 'lengthOfLIS', types: ['int[]'],
  sig: 'public int lengthOfLIS(int[] nums)',
  starter: U + `class Solution {
    public int lengthOfLIS(int[] nums) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int lengthOfLIS(int[] nums) {
        if (nums.length == 0) return 0;
        int[] dp = new int[nums.length];
        Arrays.fill(dp, 1);
        int best = 1;
        for (int i = 1; i < nums.length; i++)
            for (int j = 0; j < i; j++)
                if (nums[j] < nums[i]) { dp[i] = Math.max(dp[i], dp[j] + 1); best = Math.max(best, dp[i]); }
        return best;
    }
}`},

'max-subarray': {
  fn: 'maxSubArray', types: ['int[]'],
  sig: 'public int maxSubArray(int[] nums)',
  starter: U + `class Solution {
    public int maxSubArray(int[] nums) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int maxSubArray(int[] nums) {
        int best = nums[0], cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }
}`},

'unique-paths': {
  fn: 'uniquePaths', types: ['int', 'int'],
  sig: 'public int uniquePaths(int m, int n)',
  starter: U + `class Solution {
    public int uniquePaths(int m, int n) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                row[j] += row[j - 1];
        return row[n - 1];
    }
}`},

/* ================= linked lists ================= */
'reverse-linked-list': {
  fn: 'reverseList', types: ['ListNode'],
  sig: 'public ListNode reverseList(ListNode head)',
  starter: U + LN + `class Solution {
    public ListNode reverseList(ListNode head) {
        // your code here
        return null;
    }
}`,
  ref: U + `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        return prev;
    }
}`},

'merge-two-sorted-lists': {
  fn: 'mergeTwoLists', types: ['ListNode', 'ListNode'],
  sig: 'public ListNode mergeTwoLists(ListNode list1, ListNode list2)',
  starter: U + LN + `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // your code here
        return null;
    }
}`,
  ref: U + `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
            else { tail.next = list2; list2 = list2.next; }
            tail = tail.next;
        }
        tail.next = list1 != null ? list1 : list2;
        return dummy.next;
    }
}`},

'linked-list-cycle': {
  fn: 'hasCycle', types: ['ListNode'],
  sig: 'public boolean hasCycle(ListNode head)',
  starter: U + LN + `class Solution {
    public boolean hasCycle(ListNode head) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`},

'remove-nth-from-end': {
  fn: 'removeNthFromEnd', types: ['ListNode', 'int'],
  sig: 'public ListNode removeNthFromEnd(ListNode head, int n)',
  starter: U + LN + `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        // your code here
        return null;
    }
}`,
  ref: U + `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode ahead = dummy, behind = dummy;
        for (int i = 0; i < n + 1; i++) ahead = ahead.next;
        while (ahead != null) { ahead = ahead.next; behind = behind.next; }
        behind.next = behind.next.next;
        return dummy.next;
    }
}`},

'middle-of-linked-list': {
  fn: 'middleNode', types: ['ListNode'],
  sig: 'public ListNode middleNode(ListNode head)',
  starter: U + LN + `class Solution {
    public ListNode middleNode(ListNode head) {
        // your code here
        return null;
    }
}`,
  ref: U + `class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
}`},

'add-two-numbers': {
  fn: 'addTwoNumbers', types: ['ListNode', 'ListNode'],
  sig: 'public ListNode addTwoNumbers(ListNode l1, ListNode l2)',
  starter: U + LN + `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // your code here
        return null;
    }
}`,
  ref: U + `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0), tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry + (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0);
            carry = sum / 10;
            tail.next = new ListNode(sum % 10);
            tail = tail.next;
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        return dummy.next;
    }
}`},

/* ================= trees ================= */
'maximum-depth': {
  fn: 'maxDepth', types: ['TreeNode'],
  sig: 'public int maxDepth(TreeNode root)',
  starter: U + TN + `class Solution {
    public int maxDepth(TreeNode root) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`},

'invert-binary-tree': {
  fn: 'invertTree', types: ['TreeNode'],
  sig: 'public TreeNode invertTree(TreeNode root)',
  starter: U + TN + `class Solution {
    public TreeNode invertTree(TreeNode root) {
        // your code here
        return null;
    }
}`,
  ref: U + `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        root.left = invertTree(root.right);
        root.right = left;
        return root;
    }
}`},

'same-tree': {
  fn: 'isSameTree', types: ['TreeNode', 'TreeNode'],
  sig: 'public boolean isSameTree(TreeNode p, TreeNode q)',
  starter: U + TN + `class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null || p.val != q.val) return false;
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}`},

'validate-bst': {
  fn: 'isValidBST', types: ['TreeNode'],
  sig: 'public boolean isValidBST(TreeNode root)',
  starter: U + TN + `class Solution {
    public boolean isValidBST(TreeNode root) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean isValidBST(TreeNode root) {
        return check(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    private boolean check(TreeNode node, long lo, long hi) {
        if (node == null) return true;
        if (node.val <= lo || node.val >= hi) return false;
        return check(node.left, lo, node.val) && check(node.right, node.val, hi);
    }
}`},

'level-order-traversal': {
  fn: 'levelOrder', types: ['TreeNode'],
  sig: 'public List<List<Integer>> levelOrder(TreeNode root)',
  starter: U + TN + `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // your code here
        return new ArrayList<>();
    }
}`,
  ref: U + `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        LinkedList<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            int size = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.add(node.left);
                if (node.right != null) q.add(node.right);
            }
            out.add(level);
        }
        return out;
    }
}`},

'lca-of-bst': {
  fn: 'lowestCommonAncestor', types: ['TreeNode', 'int', 'int'],
  sig: 'public Integer lowestCommonAncestor(TreeNode root, int pVal, int qVal)',
  starter: U + TN + `class Solution {
    public Integer lowestCommonAncestor(TreeNode root, int pVal, int qVal) {
        // your code here — return the LCA node's value, or null if not found
        return null;
    }
}`,
  ref: U + `class Solution {
    public Integer lowestCommonAncestor(TreeNode root, int pVal, int qVal) {
        TreeNode cur = root;
        while (cur != null) {
            if (pVal < cur.val && qVal < cur.val) cur = cur.left;
            else if (pVal > cur.val && qVal > cur.val) cur = cur.right;
            else return cur.val;
        }
        return null;
    }
}`},

/* ================= graphs ================= */
'number-of-islands': {
  fn: 'numIslands', types: ['int[][]'],
  sig: 'public int numIslands(int[][] grid)',
  starter: U + `class Solution {
    public int numIslands(int[][] grid) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int numIslands(int[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == 1) { count++; sink(grid, r, c); }
        return count;
    }
    private void sink(int[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != 1) return;
        grid[r][c] = 0;
        sink(grid, r + 1, c); sink(grid, r - 1, c); sink(grid, r, c + 1); sink(grid, r, c - 1);
    }
}`},

'course-schedule': {
  fn: 'canFinish', types: ['int', 'int[][]'],
  sig: 'public boolean canFinish(int numCourses, int[][] prerequisites)',
  starter: U + `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[numCourses];
        for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indegree[p[0]]++; }
        LinkedList<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) if (indegree[i] == 0) q.add(i);
        int taken = 0;
        while (!q.isEmpty()) {
            int c = q.poll();
            taken++;
            for (int next : adj.get(c)) if (--indegree[next] == 0) q.add(next);
        }
        return taken == numCourses;
    }
}`},

'connected-components': {
  fn: 'countComponents', types: ['int', 'int[][]'],
  sig: 'public int countComponents(int n, int[][] edges)',
  starter: U + `class Solution {
    public int countComponents(int n, int[][] edges) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    private int[] parent;
    public int countComponents(int n, int[][] edges) {
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int count = n;
        for (int[] e : edges) if (union(e[0], e[1])) count--;
        return count;
    }
    private int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    private boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        parent[ra] = rb;
        return true;
    }
}`},

'rotting-oranges': {
  fn: 'orangesRotting', types: ['int[][]'],
  sig: 'public int orangesRotting(int[][] grid)',
  starter: U + `class Solution {
    public int orangesRotting(int[][] grid) {
        // your code here
        return -1;
    }
}`,
  ref: U + `class Solution {
    public int orangesRotting(int[][] grid) {
        int rows = grid.length, cols = grid[0].length, fresh = 0;
        LinkedList<int[]> q = new LinkedList<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.add(new int[]{r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        if (fresh == 0) return 0;
        int minutes = -1;
        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
        while (!q.isEmpty()) {
            int size = q.size();
            minutes++;
            for (int i = 0; i < size; i++) {
                int[] cell = q.poll();
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        q.add(new int[]{nr, nc});
                    }
                }
            }
        }
        return fresh == 0 ? minutes : -1;
    }
}`},

'graph-valid-tree': {
  fn: 'validTree', types: ['int', 'int[][]'],
  sig: 'public boolean validTree(int n, int[][] edges)',
  starter: U + `class Solution {
    public boolean validTree(int n, int[][] edges) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    private int[] parent;
    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) return false;
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int[] e : edges) if (!union(e[0], e[1])) return false;
        return true;
    }
    private int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    private boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        parent[ra] = rb;
        return true;
    }
}`},

'is-graph-bipartite': {
  fn: 'isBipartite', types: ['int[][]'],
  sig: 'public boolean isBipartite(int[][] graph)',
  starter: U + `class Solution {
    public boolean isBipartite(int[][] graph) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n];
        Arrays.fill(color, -1);
        for (int start = 0; start < n; start++) {
            if (color[start] != -1) continue;
            LinkedList<Integer> q = new LinkedList<>();
            q.add(start);
            color[start] = 0;
            while (!q.isEmpty()) {
                int node = q.poll();
                for (int next : graph[node]) {
                    if (color[next] == -1) { color[next] = 1 - color[node]; q.add(next); }
                    else if (color[next] == color[node]) return false;
                }
            }
        }
        return true;
    }
}`},

/* ================= hashmaps & sets ================= */
'top-k-frequent': {
  fn: 'topKFrequent', types: ['int[]', 'int'],
  sig: 'public int[] topKFrequent(int[] nums, int k)',
  starter: U + `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // your code here — remember the stated tie-break: equal counts -> smaller value first
        return new int[0];
    }
}`,
  ref: U + `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.merge(n, 1, Integer::sum);
        List<Integer> keys = new ArrayList<>(freq.keySet());
        keys.sort((a, b) -> freq.get(a).equals(freq.get(b)) ? Integer.compare(a, b) : Integer.compare(freq.get(b), freq.get(a)));
        int[] out = new int[k];
        for (int i = 0; i < k; i++) out[i] = keys.get(i);
        return out;
    }
}`},

'first-unique-character': {
  fn: 'firstUniqChar', types: ['String'],
  sig: 'public int firstUniqChar(String s)',
  starter: U + `class Solution {
    public int firstUniqChar(String s) {
        // your code here
        return -1;
    }
}`,
  ref: U + `class Solution {
    public int firstUniqChar(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.merge(c, 1, Integer::sum);
        for (int i = 0; i < s.length(); i++) if (counts.get(s.charAt(i)) == 1) return i;
        return -1;
    }
}`},

'subarray-sum-equals-k': {
  fn: 'subarraySum', types: ['int[]', 'int'],
  sig: 'public int subarraySum(int[] nums, int k)',
  starter: U + `class Solution {
    public int subarraySum(int[] nums, int k) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> prefixCounts = new HashMap<>();
        prefixCounts.put(0, 1);
        int sum = 0, count = 0;
        for (int n : nums) {
            sum += n;
            count += prefixCounts.getOrDefault(sum - k, 0);
            prefixCounts.merge(sum, 1, Integer::sum);
        }
        return count;
    }
}`},

'longest-consecutive-sequence': {
  fn: 'longestConsecutive', types: ['int[]'],
  sig: 'public int longestConsecutive(int[] nums)',
  starter: U + `class Solution {
    public int longestConsecutive(int[] nums) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) set.add(n);
        int best = 0;
        for (int n : set) {
            if (set.contains(n - 1)) continue;
            int len = 1;
            while (set.contains(n + len)) len++;
            best = Math.max(best, len);
        }
        return best;
    }
}`},

'isomorphic-strings': {
  fn: 'isIsomorphic', types: ['String', 'String'],
  sig: 'public boolean isIsomorphic(String s, String t)',
  starter: U + `class Solution {
    public boolean isIsomorphic(String s, String t) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean isIsomorphic(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Character> fwd = new HashMap<>();
        Map<Character, Character> back = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char a = s.charAt(i), b = t.charAt(i);
            if (fwd.containsKey(a) && fwd.get(a) != b) return false;
            if (back.containsKey(b) && back.get(b) != a) return false;
            fwd.put(a, b);
            back.put(b, a);
        }
        return true;
    }
}`},

'contains-duplicate-ii': {
  fn: 'containsNearbyDuplicate', types: ['int[]', 'int'],
  sig: 'public boolean containsNearbyDuplicate(int[] nums, int k)',
  starter: U + `class Solution {
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        Map<Integer, Integer> last = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (last.containsKey(nums[i]) && i - last.get(nums[i]) <= k) return true;
            last.put(nums[i], i);
        }
        return false;
    }
}`},

/* ================= backtracking ================= */
'subsets': {
  fn: 'subsets', types: ['int[]'],
  sig: 'public List<List<Integer>> subsets(int[] nums)',
  starter: U + `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        // your code here — keep elements in their original input order within each subset
        return new ArrayList<>();
    }
}`,
  ref: U + `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), out);
        return out;
    }
    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1, path, out);
            path.remove(path.size() - 1);
        }
    }
}`},

'combinations': {
  fn: 'combine', types: ['int', 'int'],
  sig: 'public List<List<Integer>> combine(int n, int k)',
  starter: U + `class Solution {
    public List<List<Integer>> combine(int n, int k) {
        // your code here — numbers within each combination stay in ascending order
        return new ArrayList<>();
    }
}`,
  ref: U + `class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> out = new ArrayList<>();
        backtrack(n, k, 1, new ArrayList<>(), out);
        return out;
    }
    private void backtrack(int n, int k, int start, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == k) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i <= n; i++) {
            path.add(i);
            backtrack(n, k, i + 1, path, out);
            path.remove(path.size() - 1);
        }
    }
}`},

'permutations': {
  fn: 'permute', types: ['int[]'],
  sig: 'public List<List<Integer>> permute(int[] nums)',
  starter: U + `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        // your code here
        return new ArrayList<>();
    }
}`,
  ref: U + `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }
    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == nums.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, out);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}`},

'letter-combinations-phone-number': {
  fn: 'letterCombinations', types: ['String'],
  sig: 'public List<String> letterCombinations(String digits)',
  starter: U + `class Solution {
    public List<String> letterCombinations(String digits) {
        // your code here — an empty input returns an empty list
        return new ArrayList<>();
    }
}`,
  ref: U + `class Solution {
    private static final String[] KEYS = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    public List<String> letterCombinations(String digits) {
        List<String> out = new ArrayList<>();
        if (digits.isEmpty()) return out;
        backtrack(digits, 0, new StringBuilder(), out);
        return out;
    }
    private void backtrack(String digits, int i, StringBuilder path, List<String> out) {
        if (i == digits.length()) { out.add(path.toString()); return; }
        for (char c : KEYS[digits.charAt(i) - '0'].toCharArray()) {
            path.append(c);
            backtrack(digits, i + 1, path, out);
            path.deleteCharAt(path.length() - 1);
        }
    }
}`},

'word-search': {
  fn: 'exist', types: ['char[][]', 'String'],
  sig: 'public boolean exist(char[][] board, String word)',
  starter: U + `class Solution {
    public boolean exist(char[][] board, String word) {
        // your code here
        return false;
    }
}`,
  ref: U + `class Solution {
    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }
    private boolean dfs(char[][] board, String word, int r, int c, int i) {
        if (i == word.length()) return true;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(i)) return false;
        char saved = board[r][c];
        board[r][c] = '#';
        boolean found = dfs(board, word, r + 1, c, i + 1) || dfs(board, word, r - 1, c, i + 1)
                     || dfs(board, word, r, c + 1, i + 1) || dfs(board, word, r, c - 1, i + 1);
        board[r][c] = saved;
        return found;
    }
}`},

'n-queens-count': {
  fn: 'totalNQueens', types: ['int'],
  sig: 'public int totalNQueens(int n)',
  starter: U + `class Solution {
    public int totalNQueens(int n) {
        // your code here
        return 0;
    }
}`,
  ref: U + `class Solution {
    public int totalNQueens(int n) {
        return backtrack(n, 0, new HashSet<>(), new HashSet<>(), new HashSet<>());
    }
    private int backtrack(int n, int row, Set<Integer> cols, Set<Integer> diag, Set<Integer> anti) {
        if (row == n) return 1;
        int count = 0;
        for (int col = 0; col < n; col++) {
            if (cols.contains(col) || diag.contains(row - col) || anti.contains(row + col)) continue;
            cols.add(col); diag.add(row - col); anti.add(row + col);
            count += backtrack(n, row + 1, cols, diag, anti);
            cols.remove(col); diag.remove(row - col); anti.remove(row + col);
        }
        return count;
    }
}`}

};
