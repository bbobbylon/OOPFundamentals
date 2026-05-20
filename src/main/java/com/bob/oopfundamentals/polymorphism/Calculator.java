package com.bob.oopfundamentals.polymorphism;

/*
 * Calculator demonstrates COMPILE-TIME polymorphism (a.k.a. method OVERLOADING).
 *
 * Notice: all three methods are named `add`, but they take different
 * parameters (two ints, three ints, two doubles, or a String + String).
 * Java picks WHICH `add` to call based on what you pass it — that decision
 * is made at COMPILE time, not at run time.
 */
public class Calculator {

    /** add two ints */
    public int add(int a, int b) {
        System.out.println("    [Calculator] add(int, int) -> " + a + " + " + b);
        return a + b;
    }

    /** add THREE ints — same name, different parameter list */
    public int add(int a, int b, int c) {
        System.out.println("    [Calculator] add(int, int, int) -> " + a + " + " + b + " + " + c);
        return a + b + c;
    }

    /** add two doubles */
    public double add(double a, double b) {
        System.out.println("    [Calculator] add(double, double) -> " + a + " + " + b);
        return a + b;
    }

    /** "add" (concatenate) two strings */
    public String add(String a, String b) {
        System.out.println("    [Calculator] add(String, String) -> \"" + a + "\" + \"" + b + "\"");
        return a + b;
    }
}
