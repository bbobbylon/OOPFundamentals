package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.generics.Box;
import com.bob.oopfundamentals.generics.Pair;
import com.bob.oopfundamentals.generics.Utilities;

import java.util.ArrayList;
import java.util.List;

public class GenericsDemo {

    public static void run() {
        Section.header("9) GENERICS",
                "<T> placeholders give us type-safe reusable containers.");

        Section.subheader("Generic class: Box<T>");
        Box<String> stringBox = new Box<>();
        stringBox.put("Hello!");
        System.out.println("    stringBox.peek() = " + stringBox.peek());

        Box<Integer> intBox = new Box<>();
        intBox.put(42);
        System.out.println("    intBox.peek()    = " + intBox.peek());

        // The next line would NOT COMPILE — that's the whole point of generics:
        //     stringBox.put(123);   // <-- compiler error: int is not a String
        System.out.println("    -> The compiler refuses to let you put an int into a Box<String>.");

        Section.subheader("Generic class with two type parameters: Pair<K, V>");
        Pair<String, Integer> ageOf = new Pair<>("Bobby", 30);
        Pair<Integer, Integer> point = new Pair<>(3, 5);
        System.out.println("    ageOf = " + ageOf + " | point = " + point);

        Section.subheader("Generic METHODS");
        List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));
        Utilities.printAll(names);
        Utilities.swap(names, 0, 2);
        System.out.println("    after swap(0,2):");
        Utilities.printAll(names);

        Section.takeaway(
                "Generics let one class/method work with many types while keeping",
                "TYPE SAFETY at compile time. No more casting from Object, no more",
                "ClassCastException at runtime. It's how every Java collection works.");
    }
}
