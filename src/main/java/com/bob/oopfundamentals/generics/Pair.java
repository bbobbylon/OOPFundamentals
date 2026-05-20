package com.bob.oopfundamentals.generics;

/**
 * A generic class with TWO type parameters.
 * Pair<String, Integer> ties together a name and a count;
 * Pair<Integer, Integer> ties two coords; etc.
 */
public class Pair<K, V> {

    private final K key;
    private final V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey()   { return key; }
    public V getValue() { return value; }

    @Override
    public String toString() {
        return "(" + key + ", " + value + ")";
    }
}
