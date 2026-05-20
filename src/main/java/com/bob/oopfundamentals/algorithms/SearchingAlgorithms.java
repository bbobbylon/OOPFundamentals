package com.bob.oopfundamentals.algorithms;

import java.util.Arrays;

/*
 * ============================================================================
 *  ALGORITHMS — SEARCHING
 * ============================================================================
 *
 *  Two classics:
 *
 *  - LINEAR SEARCH: just walk the array from index 0, checking every element.
 *    Works on ANY array (sorted or not). O(n) — worst case you check them all.
 *
 *  - BINARY SEARCH: REQUIRES a sorted array. Look at the middle; if too big,
 *    look at the left half; if too small, look at the right half; repeat.
 *    O(log n) — incredibly fast. Searching 1 million items takes ~20 checks.
 *
 *  Both methods print every step so you can trace the search.
 * ============================================================================
 */
public class SearchingAlgorithms {

    /** Returns the index of `target`, or -1 if not found. */
    public static int linearSearch(int[] arr, int target) {
        System.out.println("    [Linear] searching for " + target + " in " + Arrays.toString(arr));
        for (int i = 0; i < arr.length; i = i + 1) {
            System.out.println("    [Linear]   index " + i + " = " + arr[i]
                    + (arr[i] == target ? "  <-- MATCH" : ""));
            if (arr[i] == target) {
                return i;
            }
        }
        return -1;
    }

    /** Requires `arr` to be SORTED ascending. Returns index or -1. */
    public static int binarySearch(int[] sortedArr, int target) {
        System.out.println("    [Binary] searching for " + target + " in " + Arrays.toString(sortedArr));
        int low = 0;
        int high = sortedArr.length - 1;
        int step = 0;

        while (low <= high) {
            step = step + 1;
            int mid = (low + high) / 2;   // index of the middle element
            int midValue = sortedArr[mid];
            System.out.println("    [Binary]   step " + step
                    + " | low=" + low + " high=" + high + " mid=" + mid + " midValue=" + midValue);

            if (midValue == target) {
                System.out.println("    [Binary]   FOUND at index " + mid + " in " + step + " step(s).");
                return mid;
            } else if (midValue < target) {
                // target is bigger -> ignore the LEFT half (including mid)
                low = mid + 1;
                System.out.println("    [Binary]     " + midValue + " < " + target + " -> search RIGHT half.");
            } else {
                // target is smaller -> ignore the RIGHT half
                high = mid - 1;
                System.out.println("    [Binary]     " + midValue + " > " + target + " -> search LEFT half.");
            }
        }
        System.out.println("    [Binary]   not found after " + step + " step(s).");
        return -1;
    }
}
