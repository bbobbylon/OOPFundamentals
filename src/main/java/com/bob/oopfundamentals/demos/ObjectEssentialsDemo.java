package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.objectessentials.IdGenerator;
import com.bob.oopfundamentals.objectessentials.Money;
import com.bob.oopfundamentals.objectessentials.Person;
import com.bob.oopfundamentals.objectessentials.Priority;

import java.util.HashSet;
import java.util.Set;

public class ObjectEssentialsDemo {

    public static void run() {
        Section.header("11) OBJECT ESSENTIALS",
                "equals/hashCode/toString, immutability, static, enum.");

        Section.subheader("equals() and hashCode() — used by HashMap / HashSet");
        Person a = new Person("Bobby", 30);
        Person b = new Person("Bobby", 30);
        Person c = new Person("Alice", 25);

        System.out.println("    a == b ?            " + (a == b)             + "  (reference equality — different objects)");
        System.out.println("    a.equals(b) ?       " + a.equals(b)          + "  (value equality — our override says yes)");
        System.out.println("    a.hashCode() == b   " + (a.hashCode() == b.hashCode())
                + "  (must be true if equals is true!)");

        Set<Person> people = new HashSet<>();
        people.add(a);
        people.add(b);     // same value as a — won't be added a second time
        people.add(c);
        System.out.println("    set size after adding a, b, c = " + people.size() + "  (a and b dedup correctly)");

        Section.subheader("toString() — defines how the object looks when printed");
        System.out.println("    " + a);   // calls toString() implicitly

        Section.subheader("Immutability — Money objects never change after construction");
        Money five = new Money(500, "$");        // $5.00
        Money three = new Money(300, "$");       // $3.00
        Money eight = five.plus(three);          // returns NEW Money; five & three untouched
        System.out.println("    five  = " + five);
        System.out.println("    three = " + three);
        System.out.println("    five.plus(three) -> " + eight + "   (five and three are UNCHANGED)");

        Section.subheader("static — shared by the whole class");
        int id1 = IdGenerator.newId();
        int id2 = IdGenerator.newId();
        int id3 = IdGenerator.newId();
        System.out.println("    issued IDs: " + id1 + ", " + id2 + ", " + id3
                + "   (notice they keep climbing — static counter is shared)");

        Section.subheader("enum — a fixed set of named constants, with behavior");
        Priority p1 = Priority.LOW;
        Priority p2 = Priority.HIGH;
        System.out.println("    " + p2 + " more urgent than " + p1 + "? " + p2.isMoreUrgentThan(p1));
        System.out.println("    CRITICAL.getWeight() = " + Priority.CRITICAL.getWeight());

        Section.takeaway(
                "Override equals() AND hashCode() together — never one without the other.",
                "Immutable classes are thread-safe and easier to reason about. Default to them.",
                "static members belong to the CLASS; instance members belong to each OBJECT.",
                "enums beat 'magic strings' — typos become compile errors.");
    }
}
