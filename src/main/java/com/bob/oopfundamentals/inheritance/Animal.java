package com.bob.oopfundamentals.inheritance;

/*
 * ============================================================================
 *  INHERITANCE — "a subclass IS-A superclass, and inherits its behavior"
 * ============================================================================
 *
 *  Animal is the SUPERCLASS (also called "parent" or "base" class).
 *  Dog, Cat, and Bird are SUBCLASSES — they say "extends Animal", meaning:
 *      "I AM an Animal. I get all the Animal stuff for free, and I can add
 *       my own extras or change some behaviors."
 *
 *  Why this is useful:
 *      - We write the shared code ONCE (name, age, eat, sleep) here.
 *      - Each subclass only writes what makes IT different.
 *      - We avoid copy-paste, and the world gets a consistent "Animal" idea.
 *
 *  The fields here are `protected` instead of `private`. That keyword means:
 *      "private to outsiders, but my own subclasses ARE allowed to see me."
 *  So Dog/Cat/Bird can read `name` and `age` directly.
 * ============================================================================
 */
public class Animal {

    protected String name;
    protected int age;
    protected String sound;   // each subclass will set this to "Woof", "Meow", etc.

    public Animal(String name, int age, String sound) {
        this.name = name;
        this.age = age;
        this.sound = sound;
        System.out.println("    [Animal ctor] Built an Animal named '" + name
                + "', age " + age + ", sound '" + sound + "'.");
    }

    // -- Behaviors that ALL animals share ------------------------------------

    public void eat() {
        System.out.println("    " + name + " is eating.");
    }

    public void sleep() {
        System.out.println("    " + name + " is sleeping. Zzz.");
    }

    /**
     * makeSound() is defined here, but subclasses will OVERRIDE it to provide
     * their own version. This is the bridge from inheritance to polymorphism
     * (we'll see overriding in action in the Polymorphism demo too).
     */
    public void makeSound() {
        System.out.println("    " + name + " says: " + sound);
    }

    public String getName() { return name; }
    public int getAge() { return age; }
}
