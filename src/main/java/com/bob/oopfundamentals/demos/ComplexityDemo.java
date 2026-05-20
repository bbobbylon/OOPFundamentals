package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.complexity.BigODemo;

public class ComplexityDemo {

    public static void run() {
        Section.header("16) BIG O & COMPLEXITY",
                "How algorithms scale. The #1 thing interviewers ask about.");

        Section.subheader("Linear vs Binary search on 10 million elements");
        BigODemo.run();

        Section.takeaway(
                "O(1) constant   — array index, HashMap.get average",
                "O(log n)        — binary search, balanced tree",
                "O(n) linear     — single pass over data",
                "O(n log n)      — merge sort, quick sort average",
                "O(n^2) quadratic— nested loops over the same data",
                "Always be ready to state the time AND space complexity of your code.");
    }
}
