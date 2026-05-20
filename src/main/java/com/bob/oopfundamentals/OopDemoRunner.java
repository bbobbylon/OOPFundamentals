package com.bob.oopfundamentals;

import com.bob.oopfundamentals.demos.AbstractionDemo;
import com.bob.oopfundamentals.demos.AlgorithmsDemo;
import com.bob.oopfundamentals.demos.CollectionsDemo;
import com.bob.oopfundamentals.demos.CompositionDemo;
import com.bob.oopfundamentals.demos.ComplexityDemo;
import com.bob.oopfundamentals.demos.ConcurrencyDemo;
import com.bob.oopfundamentals.demos.DataStructuresDemo;
import com.bob.oopfundamentals.demos.DesignPatternsDemo;
import com.bob.oopfundamentals.demos.EncapsulationDemo;
import com.bob.oopfundamentals.demos.ExceptionsDemo;
import com.bob.oopfundamentals.demos.FunctionalDemo;
import com.bob.oopfundamentals.demos.GenericsDemo;
import com.bob.oopfundamentals.demos.GraphDemo;
import com.bob.oopfundamentals.demos.HashMapDemo;
import com.bob.oopfundamentals.demos.InheritanceDemo;
import com.bob.oopfundamentals.demos.JvmInternalsDemo;
import com.bob.oopfundamentals.demos.NetworkingDemo;
import com.bob.oopfundamentals.demos.ObjectEssentialsDemo;
import com.bob.oopfundamentals.demos.PolymorphismDemo;
import com.bob.oopfundamentals.demos.RecursionDemo;
import com.bob.oopfundamentals.demos.ReflectionDemo;
import com.bob.oopfundamentals.demos.RestApiDemo;
import com.bob.oopfundamentals.demos.SolidDemo;
import com.bob.oopfundamentals.demos.SqlDemo;
import com.bob.oopfundamentals.demos.StringsDemo;
import com.bob.oopfundamentals.demos.WildcardsDemo;

/**
 * The "press play" button.
 *
 * Walks through every concept in sequence — from the four OOP pillars to the
 * advanced topics every entry-level dev should at least recognize.
 *
 *   1-4    OOP pillars (encapsulation, inheritance, polymorphism, abstraction)
 *   5-6    Core data structures and algorithms
 *   7-10   Design fundamentals (SOLID, composition, generics, exceptions)
 *   11-13  Java essentials (Object methods, collections, lambdas/streams)
 *   14     Classic design patterns
 *   15-17  Recursion, Big O, string-manipulation interview classics
 *   18-19  More data structures (HashMap from scratch, Graphs + BFS/DFS)
 *   20-21  Concurrency and generic wildcards (PECS)
 *   22-23  JVM internals and reflection/annotations
 *   24-26  Networking (TCP), SQL/JDBC, REST API design
 */
public final class OopDemoRunner {

    private OopDemoRunner() {}

    public static void runAll() throws Exception {
        System.out.println();
        System.out.println("################################################################");
        System.out.println("#                                                              #");
        System.out.println("#     PROGRAMMING FUNDAMENTALS — A LIVE WALKTHROUGH            #");
        System.out.println("#                                                              #");
        System.out.println("#  Everything an entry-level dev should be able to recognize   #");
        System.out.println("#  and explain. Verbose prints — follow each variable.         #");
        System.out.println("#                                                              #");
        System.out.println("################################################################");

        // --- OOP pillars ---
        EncapsulationDemo.run();
        InheritanceDemo.run();
        PolymorphismDemo.run();
        AbstractionDemo.run();

        // --- Core CS ---
        DataStructuresDemo.run();
        AlgorithmsDemo.run();

        // --- Design fundamentals ---
        SolidDemo.run();
        CompositionDemo.run();
        GenericsDemo.run();
        ExceptionsDemo.run();

        // --- Java essentials ---
        ObjectEssentialsDemo.run();
        CollectionsDemo.run();
        FunctionalDemo.run();

        // --- Patterns ---
        DesignPatternsDemo.run();

        // --- Interview classics ---
        RecursionDemo.run();
        ComplexityDemo.run();
        StringsDemo.run();

        // --- More data structures ---
        HashMapDemo.run();
        GraphDemo.run();

        // --- Advanced Java ---
        ConcurrencyDemo.run();
        WildcardsDemo.run();
        JvmInternalsDemo.run();
        ReflectionDemo.run();

        // --- Real-world systems ---
        NetworkingDemo.run();
        SqlDemo.run();
        RestApiDemo.run();

        System.out.println();
        System.out.println("################################################################");
        System.out.println("  ALL DEMOS COMPLETE.  Re-read the demo files and the classes");
        System.out.println("  they use — every variable and step is commented inline.");
        System.out.println("################################################################");
        System.out.println();
    }
}
