package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.inheritance.Animal;
import com.bob.oopfundamentals.inheritance.Bird;
import com.bob.oopfundamentals.inheritance.Cat;
import com.bob.oopfundamentals.inheritance.Dog;

public class InheritanceDemo {

    public static void run() {
        Section.header("2) INHERITANCE",
                "Subclasses inherit fields and behavior from a parent class.");

        System.out.println(">> Step 1: build three different Animals.");
        Dog dog = new Dog("Rex", 5, "Golden Retriever");
        Cat cat = new Cat("Whiskers", 3, true);
        Bird bird = new Bird("Tweety", 1, true);

        Section.subheader("Each one inherits eat() and sleep() from Animal — same code, all 3 get it.");
        dog.eat();
        cat.eat();
        bird.sleep();

        Section.subheader("makeSound() was OVERRIDDEN by each subclass.");
        dog.makeSound();
        cat.makeSound();
        bird.makeSound();

        Section.subheader("Each subclass also adds behavior the others don't have.");
        dog.fetch();
        cat.scratch();
        bird.fly();

        Section.subheader("'IS-A' relationship: a Dog IS an Animal — store it as one.");
        Animal asAnimal = dog;     // legal: Dog is-a Animal
        System.out.println("    Variable type: Animal | actual object: Dog");
        System.out.println("    asAnimal.getName() = " + asAnimal.getName());
        asAnimal.makeSound();       // still calls Dog's overridden version! (sneak preview of polymorphism)

        Section.takeaway(
                "We wrote eat()/sleep() ONCE in Animal and every subclass got it free.",
                "Each subclass only had to provide what made IT unique (breed, fly, etc).",
                "When we used `Animal asAnimal = dog`, Java still ran Dog's makeSound()",
                "— that's polymorphism kicking in, which is our next stop.");
    }
}
