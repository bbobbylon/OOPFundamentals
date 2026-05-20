package com.bob.oopfundamentals.demos;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/*
 * Java's built-in Collections Framework. This is what you actually use day-to-day —
 * the hand-built MyLinkedList etc. earlier was to show you what's inside.
 *
 *  Cheat sheet:
 *    List       — ordered, allows duplicates, has indexes.    e.g. ArrayList, LinkedList
 *    Set        — no duplicates, usually unordered.           e.g. HashSet, TreeSet
 *    Map        — key -> value lookup.                        e.g. HashMap, TreeMap
 */
public class CollectionsDemo {

    public static void run() {
        Section.header("12) JAVA COLLECTIONS FRAMEWORK",
                "ArrayList, LinkedList, HashMap, HashSet — when to use which.");

        Section.subheader("ArrayList — fast random access, slow inserts in the middle");
        List<String> arr = new ArrayList<>();
        arr.add("apple"); arr.add("banana"); arr.add("cherry");
        System.out.println("    arr            = " + arr);
        System.out.println("    arr.get(1)     = " + arr.get(1) + "   (O(1) random access)");
        arr.remove("banana");
        System.out.println("    after remove   = " + arr);

        Section.subheader("LinkedList — fast at the ends, slow in the middle");
        LinkedList<Integer> linked = new LinkedList<>();
        linked.addFirst(2);   // O(1)
        linked.addFirst(1);   // O(1)
        linked.addLast(3);    // O(1)
        System.out.println("    linked         = " + linked);

        Section.subheader("HashSet — no duplicates, unordered");
        Set<String> seen = new HashSet<>();
        seen.add("alpha"); seen.add("beta"); seen.add("alpha");  // duplicate ignored
        System.out.println("    set            = " + seen + "  (size " + seen.size() + ")");
        System.out.println("    contains alpha = " + seen.contains("alpha") + "   (O(1) lookup)");

        Section.subheader("TreeSet — sorted (kept in order automatically)");
        Set<Integer> sorted = new TreeSet<>();
        sorted.add(5); sorted.add(1); sorted.add(9); sorted.add(3);
        System.out.println("    treeset        = " + sorted + "   (note the natural ordering)");

        Section.subheader("HashMap — key -> value lookup, O(1) average");
        Map<String, Integer> ages = new HashMap<>();
        ages.put("Bobby", 30);
        ages.put("Alice", 25);
        ages.put("Bob",   42);
        System.out.println("    ages           = " + ages);
        System.out.println("    ages.get(Bob)  = " + ages.get("Bob"));
        System.out.println("    has 'Eve'?     = " + ages.containsKey("Eve"));

        Section.subheader("TreeMap — same as HashMap but keys are kept sorted");
        Map<String, Integer> sortedAges = new TreeMap<>(ages);
        System.out.println("    sortedAges     = " + sortedAges);

        Section.subheader("Iterating a Map — every entry has a key and a value");
        for (Map.Entry<String, Integer> entry : ages.entrySet()) {
            System.out.println("    " + entry.getKey() + " -> " + entry.getValue());
        }

        Section.takeaway(
                "Need ordered access by index?           -> ArrayList",
                "Adding/removing from the front a lot?   -> LinkedList or ArrayDeque",
                "Need uniqueness?                        -> HashSet (or TreeSet if sorted)",
                "Need to look things up by key?          -> HashMap (or TreeMap if sorted)",
                "Knowing which to pick is a top entry-level interview filter.");
    }
}
