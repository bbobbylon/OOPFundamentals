package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.concurrency.Counter;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/*
 * CONCURRENCY — doing multiple things at once.
 *
 *  Two key challenges:
 *    1) RACE CONDITIONS: two threads touching the same data clobber each other.
 *    2) DEADLOCK: thread A waits for thread B's lock, thread B waits for A's.
 *
 *  Java gives you several tools (cheapest -> most powerful):
 *    - Thread / Runnable      — the raw building blocks
 *    - synchronized           — built-in mutex around a block or method
 *    - java.util.concurrent.atomic — lock-free atomic numbers/refs
 *    - ExecutorService        — managed thread pools (use these in real code)
 *    - Future / CompletableFuture — represents a not-yet-finished result
 */
public class ConcurrencyDemo {

    public static void run() throws Exception {
        Section.header("20) CONCURRENCY & MULTITHREADING",
                "Multiple threads, race conditions, locks, and ExecutorService.");

        Section.subheader("Basic thread — Runnable + Thread");
        Thread t = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("    [worker thread] tick " + i);
            }
        }, "worker");
        t.start();    // start the new thread
        t.join();     // main thread WAITS here until `worker` finishes
        System.out.println("    [main] worker done.");

        Section.subheader("RACE CONDITION — two threads incrementing the same counter");
        Counter unsafe = new Counter();
        Runnable workUnsafe = () -> {
            for (int i = 0; i < 100_000; i++) unsafe.increment();
        };
        Thread a = new Thread(workUnsafe);
        Thread b = new Thread(workUnsafe);
        a.start(); b.start();
        a.join();  b.join();
        System.out.println("    EXPECTED 200000, GOT " + unsafe.get()
                + "   (off by the lost updates — that's the race)");

        Section.subheader("FIX 1: synchronized — only one thread at a time");
        Counter safe = new Counter();
        Runnable workSafe = () -> {
            for (int i = 0; i < 100_000; i++) safe.incrementSynchronized();
        };
        Thread c = new Thread(workSafe);
        Thread d = new Thread(workSafe);
        c.start(); d.start();
        c.join();  d.join();
        System.out.println("    EXPECTED 200000, GOT " + safe.get() + "   (always exact)");

        Section.subheader("FIX 2: AtomicInteger — lock-free, hardware-level atomic ops");
        AtomicInteger atomic = new AtomicInteger();
        Runnable workAtomic = () -> {
            for (int i = 0; i < 100_000; i++) atomic.incrementAndGet();
        };
        Thread e = new Thread(workAtomic);
        Thread f = new Thread(workAtomic);
        e.start(); f.start();
        e.join();  f.join();
        System.out.println("    EXPECTED 200000, GOT " + atomic.get() + "   (also always exact)");

        Section.subheader("ExecutorService — the modern way to run many tasks");
        ExecutorService pool = Executors.newFixedThreadPool(3);
        try {
            List<Future<Integer>> futures = new ArrayList<>();
            for (int i = 1; i <= 5; i++) {
                final int taskId = i;
                // submit() takes a Callable<T>, returns a Future<T> we can await.
                Future<Integer> future = pool.submit(() -> {
                    System.out.println("    [pool] task " + taskId + " on " + Thread.currentThread().getName());
                    Thread.sleep(50);
                    return taskId * 10;
                });
                futures.add(future);
            }
            int total = 0;
            for (Future<Integer> future : futures) {
                total = total + future.get();   // blocks until that task finishes
            }
            System.out.println("    sum of all task results = " + total);
        } finally {
            pool.shutdown();
            pool.awaitTermination(5, TimeUnit.SECONDS);
        }

        Section.takeaway(
                "Threads run code concurrently — but shared mutable data is the danger.",
                "Three fixes for shared state:",
                "  synchronized — easy, but coarse-grained locking.",
                "  Atomic*      — lock-free, perfect for simple counters and flags.",
                "  Immutable    — no shared state means nothing to coordinate.",
                "Real code uses ExecutorService instead of creating Threads by hand.");
    }
}
