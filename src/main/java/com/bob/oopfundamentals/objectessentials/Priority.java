package com.bob.oopfundamentals.objectessentials;

/*
 * ENUM — a fixed, named set of constants.
 *
 *  Enums are perfect when a value can only be one of a small known set
 *  (days of the week, priority levels, traffic light colors). They give
 *  you compile-time safety: misspelling LOW gets caught by the compiler.
 *
 *  Bonus: enums in Java can have fields and methods, like a mini-class.
 */
public enum Priority {
    LOW(1),
    MEDIUM(2),
    HIGH(3),
    CRITICAL(4);

    private final int weight;

    Priority(int weight) { this.weight = weight; }

    public int getWeight() { return weight; }

    public boolean isMoreUrgentThan(Priority other) {
        return this.weight > other.weight;
    }
}
