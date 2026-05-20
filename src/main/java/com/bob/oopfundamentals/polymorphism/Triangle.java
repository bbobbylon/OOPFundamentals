package com.bob.oopfundamentals.polymorphism;

public class Triangle extends Shape {

    private final double base;
    private final double height;

    public Triangle(double base, double height) {
        super("Triangle");
        this.base = base;
        this.height = height;
    }

    /** Triangle area = (base * height) / 2. */
    @Override
    public double area() {
        return (base * height) / 2.0;
    }
}
