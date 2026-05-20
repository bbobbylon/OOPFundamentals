package com.bob.oopfundamentals.designpatterns;

import com.bob.oopfundamentals.polymorphism.Circle;
import com.bob.oopfundamentals.polymorphism.Rectangle;
import com.bob.oopfundamentals.polymorphism.Shape;
import com.bob.oopfundamentals.polymorphism.Triangle;

/*
 * FACTORY pattern — hide the messy details of "which concrete class do I build?"
 * behind a single, easy-to-use creation method.
 *
 *  Caller says:                       factory.create("circle", 5);
 *  Factory returns:                   a fully built Circle (typed as Shape).
 *
 *  Now the caller doesn't depend on the Circle/Triangle/Rectangle classes
 *  — only on the factory and the Shape abstraction. Open/Closed friendly:
 *  add a new shape and you only touch the factory.
 */
public class ShapeFactory {

    public Shape create(String kind, double... params) {
        return switch (kind.toLowerCase()) {
            case "circle"    -> new Circle(params[0]);
            case "rectangle" -> new Rectangle(params[0], params[1]);
            case "triangle"  -> new Triangle(params[0], params[1]);
            default          -> throw new IllegalArgumentException("Unknown shape: " + kind);
        };
    }
}
