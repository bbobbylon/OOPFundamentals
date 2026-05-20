package com.bob.oopfundamentals.solid;

/*
 * L — LISKOV SUBSTITUTION PRINCIPLE
 *   "A subclass must be usable anywhere its parent is used WITHOUT surprises."
 *
 *  Classic violation: Square extends Rectangle. Sounds fine — a square IS a
 *  special rectangle, right? But setting width also has to set height (or
 *  it stops being a square). Any code that thought it had a Rectangle and
 *  set width independently of height now misbehaves. That breaks LSP.
 *
 *  Below we show the principle by doing it RIGHT: Bird has a fly() method,
 *  but Penguin (which can't fly) does NOT extend Bird — because a Penguin
 *  isn't substitutable for a Bird-that-flies. Instead we model "FlyingBird"
 *  as the abstraction that matters here.
 */
public class L_LiskovSubstitution {

    /** Abstraction for things that fly — only birds that ACTUALLY fly. */
    public interface FlyingBird {
        void fly();
    }

    public static class Sparrow implements FlyingBird {
        public void fly() { System.out.println("    Sparrow takes off, flapping its wings."); }
    }

    public static class Eagle implements FlyingBird {
        public void fly() { System.out.println("    Eagle soars high above."); }
    }

    /** Penguin deliberately does NOT implement FlyingBird. */
    public static class Penguin {
        public void swim() { System.out.println("    Penguin glides through the water."); }
    }

    /** This method only ever sees flyers — never gets a confusing Penguin.fly(). */
    public static void makeItFly(FlyingBird bird) {
        bird.fly();
    }

    public static void demo() {
        makeItFly(new Sparrow());
        makeItFly(new Eagle());
        new Penguin().swim();
        System.out.println("    -> A subtype must HONOR the parent's contract. If it can't, model it differently.");
    }
}
