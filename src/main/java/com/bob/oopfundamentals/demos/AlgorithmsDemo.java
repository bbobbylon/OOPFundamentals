package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.algorithms.SearchingAlgorithms;
import com.bob.oopfundamentals.algorithms.SortingAlgorithms;

import java.util.Arrays;

public class AlgorithmsDemo {

    public static void run() {
        Section.header("6) ALGORITHMS",
                "Step-by-step recipes to solve problems. Watch them work.");

        int[] unsorted = {5, 2, 9, 1, 7, 3};

        Section.subheader("Bubble Sort (simple, O(n^2))");
        int[] bubbled = SortingAlgorithms.bubbleSort(unsorted);
        System.out.println("    bubble result: " + Arrays.toString(bubbled));

        Section.subheader("Quick Sort (divide & conquer, O(n log n) average)");
        int[] quick = SortingAlgorithms.quickSort(unsorted);
        System.out.println("    quick result:  " + Arrays.toString(quick));

        Section.subheader("Merge Sort (also O(n log n), stable, uses extra memory)");
        int[] merged = SortingAlgorithms.mergeSort(unsorted);
        System.out.println("    merge result:  " + Arrays.toString(merged));

        Section.subheader("Linear Search (works on any array)");
        int[] data = {12, 4, 7, 19, 23, 8};
        int idxLin = SearchingAlgorithms.linearSearch(data, 19);
        System.out.println("    linearSearch(19) -> index " + idxLin);

        Section.subheader("Binary Search (REQUIRES a sorted array)");
        int[] sorted = {1, 4, 7, 9, 12, 15, 19, 23, 28, 31};
        int idxBin = SearchingAlgorithms.binarySearch(sorted, 19);
        System.out.println("    binarySearch(19) -> index " + idxBin);

        System.out.println();
        System.out.println(">> Now searching for a value that's NOT in the array (42):");
        SearchingAlgorithms.binarySearch(sorted, 42);

        Section.takeaway(
                "Notice how bubble sort revisits the array many times, while quick sort",
                "carves the problem in half each recursive call. Same idea for search:",
                "linear walks every cell; binary doubles its progress each step. The",
                "algorithm you pick has a HUGE effect on speed as the input grows.");
    }
}
