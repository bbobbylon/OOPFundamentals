package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.recursion.RecursionExamples;

public class RecursionDemo {

    public static void run() {
        Section.header("15) RECURSION",
                "Methods that call themselves on smaller versions of the problem.");

        Section.subheader("factorial(5) — watch the calls stack up, then collapse");
        int f = RecursionExamples.factorial(5);
        System.out.println("    -> factorial(5) = " + f);

        Section.subheader("fibonacci(0..9)");
        for (int i = 0; i < 10; i++) {
            System.out.println("    fib(" + i + ") = " + RecursionExamples.fibonacci(i));
        }

        Section.subheader("sumDigits(1234) — recurse by peeling off the last digit");
        System.out.println("    sumDigits(1234) = " + RecursionExamples.sumDigits(1234));
        System.out.println("    sumDigits(98765) = " + RecursionExamples.sumDigits(98765));

        Section.takeaway(
                "Every recursive method needs a BASE CASE (when to stop) and a",
                "RECURSIVE STEP (call itself on a smaller input). Many problems",
                "(trees, divide-and-conquer, backtracking) are MUCH cleaner with",
                "recursion than with explicit loops.");
    }
}
