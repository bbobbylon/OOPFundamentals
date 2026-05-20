package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.datastructures.MyHashMap;

public class HashMapDemo {

    public static void run() {
        Section.header("18) HASH MAP (FROM SCRATCH)",
                "The data structure behind HashMap / dict / object. Demystified.");

        MyHashMap<String, Integer> ages = new MyHashMap<>();
        ages.put("Bobby",   30);
        ages.put("Alice",   25);
        ages.put("Bob",     42);
        ages.put("Charlie", 35);
        ages.put("Dave",    28);

        System.out.println();
        ages.dumpBuckets();    // see how items distribute across buckets

        Section.subheader("Lookups — should be (very close to) O(1)");
        System.out.println("    Bobby   -> " + ages.get("Bobby"));
        System.out.println("    Alice   -> " + ages.get("Alice"));
        System.out.println("    Eve     -> " + ages.get("Eve"));

        Section.subheader("Updating an existing key");
        ages.put("Bobby", 31);
        System.out.println("    after update, Bobby -> " + ages.get("Bobby"));

        Section.takeaway(
                "HashMap = array of buckets + a hash function to pick the bucket.",
                "Collisions are normal — we resolve them by chaining (a small list per bucket).",
                "That's why your custom keys MUST implement equals() AND hashCode() correctly.");
    }
}
