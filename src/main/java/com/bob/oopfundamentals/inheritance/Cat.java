package com.bob.oopfundamentals.inheritance;

public class Cat extends Animal {

    private boolean isIndoor;

    public Cat(String name, int age, boolean isIndoor) {
        super(name, age, "Meow.");
        this.isIndoor = isIndoor;
        System.out.println("    [Cat ctor]    ...indoor cat? " + isIndoor);
    }

    @Override
    public void makeSound() {
        System.out.println("    " + name + " purrs and meows: meow~");
    }

    /** Unique to Cat. */
    public void scratch() {
        String target = isIndoor ? "the couch" : "a tree";
        System.out.println("    " + name + " is scratching " + target + ".");
    }
}
