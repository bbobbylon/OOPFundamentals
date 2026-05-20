package com.bob.oopfundamentals.objectessentials;

import java.util.Objects;

/*
 * equals(), hashCode(), toString() — the "Big Three" methods every Java object
 * inherits from Object. The defaults are usually wrong for value-style classes,
 * so we override them.
 *
 *  THE CONTRACT (memorize this for interviews):
 *    - If a.equals(b) is true, then a.hashCode() MUST equal b.hashCode().
 *    - hashCode() should be consistent: same object -> same hash, every call.
 *    - equals() must be reflexive, symmetric, transitive.
 *
 *  Why does this matter? HashMap, HashSet, and friends use BOTH methods to
 *  find your objects. If you override equals() but not hashCode(), HashSet
 *  will store "duplicates" and your day gets ruined.
 */
public class Person {

    private final String name;
    private final int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge()     { return age; }

    /** Two Persons are equal if they have the same name AND age. */
    @Override
    public boolean equals(Object other) {
        if (this == other) return true;             // same reference -> equal
        if (!(other instanceof Person p)) return false;
        return age == p.age && Objects.equals(name, p.name);
    }

    /** Must produce the same hash whenever equals() would return true. */
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }

    /** Human-readable form. Default would be "Person@1a2b3c" — useless. */
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}
