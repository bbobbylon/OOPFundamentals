package com.bob.oopfundamentals.inheritance;

/*
 * Dog EXTENDS Animal — it inherits name, age, sound, eat(), sleep(), makeSound().
 * It also ADDS a new field (breed) and a new method (fetch).
 * And it OVERRIDES makeSound() so Dogs bark instead of using the generic message.
 */
public class Dog extends Animal {

    private final String breed;   // brand-new field that only Dogs have

    public Dog(String name, int age, String breed) {
        // `super(...)` calls the Animal constructor first. We pass "Woof!" as
        // the sound because every Dog barks — the subclass decides this.
        super(name, age, "Woof!");
        this.breed = breed;
        System.out.println("    [Dog ctor]    ...and it's a " + breed + ".");
    }

    /**
     * @Override tells the compiler "I'm intentionally replacing the parent
     * version of this method." If the parent didn't have makeSound(), the
     * compiler would error here — a nice safety net.
     */
    @Override
    public void makeSound() {
        System.out.println("    " + name + " (a " + breed + ") barks: WOOF! WOOF!");
    }

    /** A brand-new behavior that only Dogs have. Cats and Birds can't fetch. */
    public void fetch() {
        System.out.println("    " + name + " runs to fetch the ball and brings it back!");
    }

    public String getBreed() { return breed; }
}
