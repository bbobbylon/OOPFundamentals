package com.bob.oopfundamentals.complexity;

/*
 * BIG O NOTATION — describes how an algorithm scales as input grows.
 *
 *  Common classes (best -> worst):
 *    O(1)        constant     — hash lookup, array index
 *    O(log n)    logarithmic  — binary search, balanced tree ops
 *    O(n)        linear       — single pass over a list
 *    O(n log n)  linearithmic — merge sort, quick sort (average)
 *    O(n^2)      quadratic    — bubble sort, naive nested loops
 *    O(2^n)      exponential  — naive recursion (e.g. brute fib)
 *
 *  Interviewers ALWAYS ask "what's the time complexity?" — practice this.
 *
 *  Below we just MEASURE wall-clock time on linear vs binary search to make
 *  it tangible. Big O is about how time GROWS, not the absolute time.
 */
public class BigODemo {

    public static void run() {
        int n = 10_000_000;
        int[] sorted = new int[n];
        for (int i = 0; i < n; i++) sorted[i] = i;

        int target = n - 1;   // last element — worst case for linear search

        // ---- O(n) linear search ----
        long t0 = System.nanoTime();
        int linIdx = -1;
        for (int i = 0; i < n; i++) {
            if (sorted[i] == target) { linIdx = i; break; }
        }
        long t1 = System.nanoTime();
        System.out.println("    LINEAR search (O(n)):   found at " + linIdx
                + "  | took " + ((t1 - t0) / 1_000_000.0) + " ms");

        // ---- O(log n) binary search ----
        long t2 = System.nanoTime();
        int low = 0, high = n - 1, binIdx = -1;
        int steps = 0;
        while (low <= high) {
            steps++;
            int mid = (low + high) >>> 1;
            if (sorted[mid] == target) { binIdx = mid; break; }
            else if (sorted[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        long t3 = System.nanoTime();
        System.out.println("    BINARY search (O(log n)): found at " + binIdx
                + "  | took " + ((t3 - t2) / 1_000_000.0) + " ms"
                + "  | only " + steps + " steps for " + n + " elements");

        System.out.println();
        System.out.println("    Linear:  ~" + n + " comparisons worst case.");
        System.out.println("    Binary:  ~" + (int) (Math.log(n) / Math.log(2)) + " comparisons worst case.");
        System.out.println("    The shape of growth matters far more than the constant factor.");
    }
}
