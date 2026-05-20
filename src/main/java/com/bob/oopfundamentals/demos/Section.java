package com.bob.oopfundamentals.demos;

/**
 * Tiny utility for pretty section headers in the demo output.
 * No OOP magic here — just keeps the runners short and readable.
 */
final class Section {

    private static final String LINE = "================================================================";

    private Section() {}

    static void header(String title, String subtitle) {
        System.out.println();
        System.out.println(LINE);
        System.out.println("  " + title);
        System.out.println("  " + subtitle);
        System.out.println(LINE);
    }

    static void takeaway(String... lines) {
        System.out.println();
        System.out.println("  >>> Takeaway:");
        for (String line : lines) {
            System.out.println("      " + line);
        }
    }

    static void subheader(String text) {
        System.out.println();
        System.out.println("---- " + text + " ----");
    }
}
