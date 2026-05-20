package com.bob.oopfundamentals.datastructures;

/*
 * ============================================================================
 *  DATA STRUCTURE: HASH MAP (from scratch)
 * ============================================================================
 *
 *  A hash map gives you ~O(1) lookup/insert by KEY. The magic:
 *
 *    1) Hash the key into a number with key.hashCode().
 *    2) Take that number mod the array size — that's the BUCKET index.
 *    3) Store the (key, value) at that bucket.
 *
 *  What if two keys land in the same bucket? That's a COLLISION. We resolve
 *  it with "chaining" — each bucket holds a small linked list of entries.
 *  On lookup we walk the list and compare keys with equals().
 *
 *  This is why equals() and hashCode() MUST agree — see ObjectEssentials.
 * ============================================================================
 */
public class MyHashMap<K, V> {

    /** One key-value entry, with a `next` link so we can chain on collision. */
    private static class Entry<K, V> {
        final K key;
        V value;
        Entry<K, V> next;
        Entry(K key, V value) { this.key = key; this.value = value; }
    }

    private Entry<K, V>[] buckets;
    private int size;

    @SuppressWarnings("unchecked")
    public MyHashMap() {
        this.buckets = (Entry<K, V>[]) new Entry[8];
        this.size = 0;
    }

    /** Where should this key live? */
    private int bucketIndex(K key) {
        // & 0x7FFFFFFF turns negative hashes positive without dividing.
        return (key.hashCode() & 0x7FFFFFFF) % buckets.length;
    }

    public void put(K key, V value) {
        int idx = bucketIndex(key);
        Entry<K, V> head = buckets[idx];

        // Walk the chain looking for an existing key — if found, update value.
        for (Entry<K, V> e = head; e != null; e = e.next) {
            if (e.key.equals(key)) {
                System.out.println("    [HashMap] put(" + key + ") -> updated existing entry in bucket " + idx);
                e.value = value;
                return;
            }
        }
        // Not found — prepend a new entry to the chain.
        Entry<K, V> newEntry = new Entry<>(key, value);
        newEntry.next = head;
        buckets[idx] = newEntry;
        size++;
        String collision = head == null ? "" : "  (collision — chain length now " + chainLength(idx) + ")";
        System.out.println("    [HashMap] put(" + key + ", " + value + ") -> bucket " + idx + collision);
    }

    public V get(K key) {
        int idx = bucketIndex(key);
        int steps = 0;
        for (Entry<K, V> e = buckets[idx]; e != null; e = e.next) {
            steps++;
            if (e.key.equals(key)) {
                System.out.println("    [HashMap] get(" + key + ") -> bucket " + idx + ", found in " + steps + " step(s)");
                return e.value;
            }
        }
        System.out.println("    [HashMap] get(" + key + ") -> bucket " + idx + ", NOT found");
        return null;
    }

    public int size() { return size; }

    private int chainLength(int idx) {
        int n = 0;
        for (Entry<K, V> e = buckets[idx]; e != null; e = e.next) n++;
        return n;
    }

    /** Render the buckets so you can SEE collisions and chains. */
    public void dumpBuckets() {
        System.out.println("    [HashMap] internal state:");
        for (int i = 0; i < buckets.length; i++) {
            StringBuilder sb = new StringBuilder();
            for (Entry<K, V> e = buckets[i]; e != null; e = e.next) {
                if (sb.length() > 0) sb.append(" -> ");
                sb.append(e.key).append('=').append(e.value);
            }
            System.out.println("      bucket[" + i + "]: " + (sb.length() == 0 ? "(empty)" : sb));
        }
    }
}
