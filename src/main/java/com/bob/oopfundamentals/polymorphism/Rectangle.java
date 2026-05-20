package com.bob.oopfundamentals.polymorphism;

public class Rectangle extends Shape {

    private final double width;
    private final double height;

    public Rectangle(double width, double height) {
        super("Rectangle");
        this.width = width;
        this.height = height;
    }

    /** Rectangle area = width * height. */
    @Override
    public double area() {
        return width * height;
    }
}
