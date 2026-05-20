package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.polymorphism.Calculator;
import com.bob.oopfundamentals.polymorphism.Circle;
import com.bob.oopfundamentals.polymorphism.Rectangle;
import com.bob.oopfundamentals.polymorphism.Shape;
import com.bob.oopfundamentals.polymorphism.Triangle;

public class PolymorphismDemo {

    public static void run() {
        Section.header("3) POLYMORPHISM",
                "One method name, different behavior depending on the actual type.");

        Section.subheader("RUNTIME polymorphism — method OVERRIDING");
        System.out.println(">> We have an array typed as Shape[], but each slot holds a different subclass.");

        // Look closely: the variable type is Shape, but the OBJECTS are Circle, Rectangle, Triangle.
        Shape[] shapes = new Shape[] {
                new Circle(5),
                new Rectangle(4, 6),
                new Triangle(3, 8)
        };

        System.out.println(">> Loop through them and call .area() on each — Java picks the right one.");
        for (Shape s : shapes) {
            // Even though `s` is typed as Shape, Java looks at the REAL object
            // (Circle / Rectangle / Triangle) and calls THAT class's area().
            // This is dynamic dispatch — the polymorphic part.
            System.out.printf("    Shape '%s' -> area = %.4f%n", s.getName(), s.area());
        }

        System.out.println();
        System.out.println(">> Same idea calling describe() (which lives on Shape but uses each subclass's area):");
        for (Shape s : shapes) {
            s.describe();
        }

        Section.subheader("COMPILE-TIME polymorphism — method OVERLOADING");
        System.out.println(">> Calculator has multiple `add` methods. Java picks one based on argument types.");
        Calculator calc = new Calculator();

        int   resultA = calc.add(2, 3);                 // (int, int)
        int   resultB = calc.add(2, 3, 4);              // (int, int, int)
        double resultC = calc.add(1.5, 2.25);           // (double, double)
        String resultD = calc.add("Hello, ", "world!"); // (String, String)

        System.out.println("    -> resultA = " + resultA);
        System.out.println("    -> resultB = " + resultB);
        System.out.println("    -> resultC = " + resultC);
        System.out.println("    -> resultD = " + resultD);

        Section.takeaway(
                "Overriding lets a subclass say 'I do this differently' (chosen at runtime).",
                "Overloading lets one class have many same-named methods that differ by",
                "parameters (chosen at compile time). Both flavors share the spirit of",
                "polymorphism: ONE name, MANY behaviors.");
    }
}
