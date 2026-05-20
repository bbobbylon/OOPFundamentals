package com.bob.oopfundamentals.inheritance;

public class Bird extends Animal {

    private final boolean canFly;   // a penguin is still a Bird but can't fly

    public Bird(String name, int age, boolean canFly) {
        super(name, age, "Tweet!");
        this.canFly = canFly;
        System.out.println("    [Bird ctor]   ...can it fly? " + canFly);
    }

    @Override
    public void makeSound() {
        System.out.println("    " + name + " chirps: tweet tweet!");
    }

    /** Unique to Bird, and even this one checks the canFly field. */
    public void fly() {
        if (canFly) {
            System.out.println("    " + name + " spreads its wings and flies away!");
        } else {
            System.out.println("    " + name + " flaps its wings sadly... and stays on the ground.");
        }
    }
}
