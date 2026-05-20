package com.bob.oopfundamentals.generics;

import java.util.List;

/**
 * Generic METHODS (as opposed to generic classes).
 * `<T>` before the return type declares a method-level type variable.
 */
public class Utilities {

    /** Print any list, of any element type. */
    public static <T> void printAll(List<T> items) {
        for (T item : items) {
            System.out.println("    item: " + item);
        }
    }

    /** Swap two elements in a list of any type. */
    public static <T> void swap(List<T> list, int i, int j) {
        T tmp = list.get(i);
        list.set(i, list.get(j));
        list.set(j, tmp);
    }
}
