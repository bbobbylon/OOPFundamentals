package com.bob.oopfundamentals.concurrency;

/*
 * A tiny counter used to demonstrate race conditions and how to fix them.
 *
 *  - increment()             — UNSAFE under multiple threads
 *  - incrementSynchronized() — SAFE: only one thread inside at a time
 */
public class Counter {

    private int value;

    public void increment() {
        // Looks atomic, but `value++` is actually THREE steps:
        //   1) read value
        //   2) add 1
        //   3) write back
        // Two threads can interleave between steps and lose updates.
        value = value + 1;
    }

    public synchronized void incrementSynchronized() {
        // The `synchronized` keyword acquires a lock on `this`. Only one
        // thread can be inside this method on the same object at a time.
        value = value + 1;
    }

    public int get() { return value; }

    public void reset() { value = 0; }
}
