package com.bob.oopfundamentals.generics;

/*
 * GENERICS — "type-safe placeholders"
 *
 *  Box<T> means "a Box of T, where T is some type we'll decide later."
 *  When you write `new Box<String>(...)`, T becomes String everywhere
 *  inside this class for THAT instance. The compiler then catches type
 *  mistakes BEFORE the program even runs.
 *
 *  Without generics, you'd store Object everywhere and constantly cast,
 *  risking ClassCastException at runtime. Generics give us safety + clarity.
 */
public class Box<T> {

    private T contents;

    public void put(T contents) { this.contents = contents; }
    public T peek()             { return contents; }
    public boolean isEmpty()    { return contents == null; }
}
