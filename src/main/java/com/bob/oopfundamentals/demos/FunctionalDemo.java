package com.bob.oopfundamentals.demos;

import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/*
 * LAMBDAS AND STREAMS — the functional-style additions to Java (since Java 8).
 *
 *  Lambdas: tiny anonymous functions.
 *    (x, y) -> x + y       // takes two args, returns their sum
 *    s -> s.length() > 3   // takes a String, returns a boolean
 *
 *  Streams: a pipeline for operating on collections without explicit loops.
 *    list.stream()
 *        .filter(x -> x > 0)        // keep only positives
 *        .map(x -> x * 2)            // double each
 *        .collect(Collectors.toList())
 *
 *  Each stream operation describes WHAT, not HOW. The pipeline reads top-to-bottom.
 */
public class FunctionalDemo {

    public static void run() {
        Section.header("13) LAMBDAS & STREAMS",
                "Functional Java: tiny inline functions + collection pipelines.");

        Section.subheader("Lambda — an inline function literal");
        // Predicate<T> = function from T to boolean
        Predicate<String> longerThan3 = s -> s.length() > 3;
        System.out.println("    longerThan3('hi')   = " + longerThan3.test("hi"));
        System.out.println("    longerThan3('hello')= " + longerThan3.test("hello"));

        // Function<T, R> = function from T to R
        Function<Integer, Integer> doubler = n -> n * 2;
        System.out.println("    doubler(7)          = " + doubler.apply(7));

        Section.subheader("Stream pipeline — filter, map, collect");
        List<Integer> numbers = Arrays.asList(1, -2, 3, -4, 5, 6);
        List<Integer> positiveDoubled = numbers.stream()
                .filter(n -> n > 0)         // keep positives
                .map(n -> n * 2)            // double them
                .collect(Collectors.toList());
        System.out.println("    input             = " + numbers);
        System.out.println("    positiveDoubled   = " + positiveDoubled);

        Section.subheader("Reduction — collapse a stream into a single value");
        int sum = numbers.stream().mapToInt(Integer::intValue).sum();
        System.out.println("    sum of input      = " + sum);

        long countBigNames = Arrays.asList("Bob", "Alexander", "Eve", "Christopher")
                .stream()
                .filter(longerThan3)
                .count();
        System.out.println("    names longer than 3 chars = " + countBigNames);

        Section.subheader("forEach — terminal action");
        Arrays.asList("a", "b", "c").stream()
                .map(String::toUpperCase)   // method reference: shorthand for (s -> s.toUpperCase())
                .forEach(s -> System.out.println("    -> " + s));

        Section.takeaway(
                "Lambdas turn 'small functions' into values you can pass around.",
                "Streams replace bulky for-loops with readable, declarative pipelines.",
                "Common building blocks: filter (keep some), map (transform), collect (gather),",
                "reduce/sum/count (collapse). Method references (Class::method) are cleaner lambdas.");
    }
}
