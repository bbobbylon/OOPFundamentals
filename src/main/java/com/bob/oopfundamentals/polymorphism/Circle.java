package com.bob.oopfundamentals.polymorphism;

public class Circle extends Shape {

    private final double radius;

    public Circle(double radius) {
        super("Circle");
        this.radius = radius;
    }

    /** Overrides Shape.area() with the real circle formula: π * r^2. */
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}
