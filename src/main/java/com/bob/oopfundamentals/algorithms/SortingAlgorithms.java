package com.bob.oopfundamentals.algorithms;

import java.util.Arrays;

/*
 * ============================================================================
 *  ALGORITHMS — SORTING
 * ============================================================================
 *
 *  Sorting = reordering items so they're in some defined order (here, smallest
 *  to largest). Different sorting algorithms make different trade-offs:
 *
 *  - BUBBLE SORT (here): super simple. O(n^2). Walks the array, swapping
 *    adjacent pairs that are out of order. Repeats until no swaps happen.
 *    Great for learning, terrible for performance on big lists.
 *
 *  - QUICK SORT (here): "divide and conquer". O(n log n) on average.
 *    Pick a pivot, partition the array into "smaller than pivot" and
 *    "bigger than pivot", then sort each half recursively.
 *
 *  We print the array after each pass so you can SEE the work happening.
 * ============================================================================
 */
public class SortingAlgorithms {

    // ----------------------- BUBBLE SORT -------------------------------------

    public static int[] bubbleSort(int[] input) {
        int[] arr = input.clone();    // copy so we don't mutate the caller's array
        int n = arr.length;
        System.out.println("    [Bubble] starting: " + Arrays.toString(arr));

        // Outer loop: each pass guarantees the next-largest value "bubbles" to the right.
        for (int pass = 0; pass < n - 1; pass = pass + 1) {
            boolean swappedThisPass = false;

            // Inner loop: compare each adjacent pair.
            // Each pass shrinks by 1 because the tail is already sorted.
            for (int i = 0; i < n - 1 - pass; i = i + 1) {
                if (arr[i] > arr[i + 1]) {
                    // Swap arr[i] and arr[i+1]
                    int tmp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = tmp;
                    swappedThisPass = true;
                }
            }

            System.out.println("    [Bubble] after pass " + (pass + 1) + ": " + Arrays.toString(arr)
                    + (swappedThisPass ? "" : "  (no swaps - already sorted, exiting early)"));

            // OPTIMIZATION: if we did a whole pass without swapping anything,
            // the array is already sorted — stop early.
            if (!swappedThisPass) break;
        }
        return arr;
    }

    // ----------------------- QUICK SORT --------------------------------------

    public static int[] quickSort(int[] input) {
        int[] arr = input.clone();
        System.out.println("    [Quick]  starting: " + Arrays.toString(arr));
        quickSortRec(arr, 0, arr.length - 1, 0);
        return arr;
    }

    private static void quickSortRec(int[] arr, int low, int high, int depth) {
        if (low >= high) return;   // 0 or 1 element — nothing to sort.

        String indent = "  ".repeat(depth);
        int pivot = arr[high];   // pick the last element as the pivot (simplest choice)
        System.out.println("    [Quick]  " + indent + "range [" + low + ".." + high
                + "] pivot=" + pivot + "  " + sliceStr(arr, low, high));

        // PARTITION step. We move everything <= pivot to the left side.
        int i = low - 1;
        for (int j = low; j < high; j = j + 1) {
            if (arr[j] <= pivot) {
                i = i + 1;
                // swap arr[i] and arr[j]
                int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
            }
        }
        // Put pivot in its final spot (between the two partitions).
        int pivotIndex = i + 1;
        int tmp = arr[pivotIndex]; arr[pivotIndex] = arr[high]; arr[high] = tmp;

        System.out.println("    [Quick]  " + indent + " -> after partition: " + Arrays.toString(arr)
                + "  pivot landed at index " + pivotIndex);

        // Recurse on the two halves.
        quickSortRec(arr, low, pivotIndex - 1, depth + 1);
        quickSortRec(arr, pivotIndex + 1, high, depth + 1);
    }

    private static String sliceStr(int[] arr, int low, int high) {
        StringBuilder sb = new StringBuilder("[");
        for (int k = low; k <= high; k = k + 1) {
            sb.append(arr[k]);
            if (k < high) sb.append(", ");
        }
        return sb.append("]").toString();
    }

    // ----------------------- MERGE SORT --------------------------------------
    //
    //  Another O(n log n) divide-and-conquer sort. Two phases:
    //    1) DIVIDE: split the array in half recursively until each piece is size 1.
    //    2) MERGE:  combine pairs of sorted pieces into bigger sorted pieces.
    //  Stable, predictable, but needs O(n) extra memory.

    public static int[] mergeSort(int[] input) {
        int[] arr = input.clone();
        System.out.println("    [Merge]  starting: " + Arrays.toString(arr));
        if (arr.length > 1) mergeSortRec(arr, 0, arr.length - 1, 0);
        return arr;
    }

    private static void mergeSortRec(int[] arr, int low, int high, int depth) {
        if (low >= high) return;
        String indent = "  ".repeat(depth);
        int mid = (low + high) / 2;
        System.out.println("    [Merge]  " + indent + "split [" + low + ".." + high + "] at " + mid);

        mergeSortRec(arr, low, mid, depth + 1);
        mergeSortRec(arr, mid + 1, high, depth + 1);
        merge(arr, low, mid, high, depth);
    }

    private static void merge(int[] arr, int low, int mid, int high, int depth) {
        String indent = "  ".repeat(depth);
        int[] left = Arrays.copyOfRange(arr, low, mid + 1);
        int[] right = Arrays.copyOfRange(arr, mid + 1, high + 1);

        int i = 0, j = 0, k = low;
        // Walk through both sub-arrays, always picking the smaller front element.
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) arr[k++] = left[i++];
            else                     arr[k++] = right[j++];
        }
        // Drain whichever side has leftovers.
        while (i < left.length)  arr[k++] = left[i++];
        while (j < right.length) arr[k++] = right[j++];

        System.out.println("    [Merge]  " + indent + " merged -> " + sliceStr(arr, low, high));
    }
}
