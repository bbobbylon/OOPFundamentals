package com.bob.oopfundamentals.demos;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

/*
 * JVM INTERNALS — a quick tour of what's under the hood when Java runs.
 *
 *  KEY IDEAS:
 *
 *   1) STACK vs HEAP
 *        - Each thread has its own STACK — holds local variables and method frames.
 *          Tiny, fast, automatically cleaned up when methods return.
 *        - The HEAP is shared by all threads — every `new` object lives there.
 *          Big, slower, cleaned by the garbage collector.
 *
 *   2) GARBAGE COLLECTION
 *        - You allocate objects with `new`. You DON'T free them — the GC does.
 *        - The GC periodically scans the heap and reclaims objects that
 *          nothing references anymore.
 *        - You can hint at it with System.gc(), but you can't force it.
 *
 *   3) CLASS LOADERS
 *        - Code (your .class files) is loaded by ClassLoader instances.
 *        - There's a hierarchy: bootstrap -> platform -> system (yours).
 *        - Frameworks like Spring use custom loaders for hot-reload / plugins.
 */
public class JvmInternalsDemo {

    public static void run() {
        Section.header("22) JVM INTERNALS",
                "Heap vs stack, garbage collection, class loaders.");

        Section.subheader("Runtime info — what the JVM has to work with");
        Runtime rt = Runtime.getRuntime();
        long mb = 1024 * 1024;
        System.out.println("    available CPU cores : " + rt.availableProcessors());
        System.out.println("    JVM max heap        : " + (rt.maxMemory() / mb) + " MB");
        System.out.println("    JVM total heap now  : " + (rt.totalMemory() / mb) + " MB");
        System.out.println("    JVM free in heap    : " + (rt.freeMemory() / mb) + " MB");

        Section.subheader("Class loader hierarchy");
        ClassLoader thisLoader = JvmInternalsDemo.class.getClassLoader();
        int depth = 0;
        ClassLoader loader = thisLoader;
        while (loader != null) {
            System.out.println("    " + "  ".repeat(depth) + "loader: " + loader);
            loader = loader.getParent();
            depth++;
        }
        System.out.println("    " + "  ".repeat(depth) + "loader: (bootstrap, written in native code)");

        Section.subheader("Garbage collection — observable in a small experiment");
        long beforeAlloc = usedMb();
        // Allocate ~50MB of arrays so we can SEE the heap usage jump.
        List<byte[]> hold = new ArrayList<>();
        for (int i = 0; i < 50; i++) hold.add(new byte[1024 * 1024]);
        long afterAlloc = usedMb();
        System.out.println("    used before alloc : " + beforeAlloc + " MB");
        System.out.println("    used after  alloc : " + afterAlloc + " MB   (heap grew)");

        // Drop the reference -> the byte[]s are now eligible for collection.
        hold = null;
        System.gc();   // hint: please collect now (not guaranteed, but usually obeyed)
        sleep(50);
        long afterGc = usedMb();
        System.out.println("    used after gc()   : " + afterGc + " MB   (heap shrank back)");

        Section.subheader("WeakReference — held only as long as something else holds the object");
        Object strong = new int[] {1, 2, 3};
        WeakReference<Object> weak = new WeakReference<>(strong);
        System.out.println("    weak.get() while strong is alive   = " + (weak.get() != null));
        strong = null;        // drop the strong reference
        System.gc();
        sleep(50);
        System.out.println("    weak.get() after strong=null + gc  = " + (weak.get() != null)
                + "   (true means GC didn't run yet — JVM's choice)");

        Section.takeaway(
                "STACK = per-thread, fast, holds local vars / method calls.",
                "HEAP  = shared, slower, holds every `new` object.",
                "GC reclaims objects that have NO references left. You don't free manually.",
                "Class loaders form a tree — they're how the JVM finds your .class files.",
                "Memory leaks in Java = unintentional references that prevent GC.");
    }

    private static long usedMb() {
        Runtime rt = Runtime.getRuntime();
        return (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
    }

    private static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
    }
}
