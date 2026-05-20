package com.bob.oopfundamentals.polymorphism;

/*
 * ============================================================================
 *  POLYMORPHISM — "many forms"
 * ============================================================================
 *
 *  Polymorphism means: ONE method name, MANY behaviors depending on the
 *  actual object you're calling it on.
 *
 *  There are TWO flavors of polymorphism in Java:
 *
 *  1) RUNTIME polymorphism (method OVERRIDING)
 *       - A subclass redefines a method that already exists in the parent.
 *       - At runtime, Java picks the version based on the ACTUAL object type.
 *       - You'll see this with Shape -> Circle/Rectangle/Triangle below.
 *       - Example: a `Shape s` variable might really hold a Circle, so
 *         `s.area()` calls Circle's area() — not Shape's.
 *
 *  2) COMPILE-TIME polymorphism (method OVERLOADING)
 *       - The SAME class has multiple methods with the same name but
 *         different parameters. Java picks one based on the arguments you pass.
 *       - See Calculator.java for that.
 *
 *  Shape is the parent. It declares `area()` and `name` but each subclass
 *  computes the area its own way using its own fields. That's overriding.
 * ============================================================================
 */
public class Shape {

    protected String name;

    public Shape(String name) {
        this.name = name;
    }

    /**
     * Default version. Subclasses will override this with real math.
     * Returning 0 keeps it safe in case someone instantiates a raw Shape.
     */
    public double area() {
        return 0.0;
    }

    public String getName() {
        return name;
    }

    /**
     * describe() shows polymorphism from the INSIDE: this method lives on Shape,
     * but when it calls `area()`, Java looks up the actual subclass's area().
     */
    public void describe() {
        System.out.println("    " + name + " has area = " + area());
    }
}
