package com.bob.oopfundamentals.abstraction;

/*
 * ============================================================================
 *  ABSTRACTION — "say WHAT, not HOW"
 * ============================================================================
 *
 *  Abstraction is the art of describing *what* something does without
 *  committing to *how* it does it. We hide the messy details behind a
 *  clean contract.
 *
 *  Java gives us TWO main tools for this:
 *
 *  1) An INTERFACE (this file)
 *     - A pure contract: "anything implementing me MUST provide these methods."
 *     - No state, no implementation (mostly).
 *     - A class can implement MANY interfaces. Great for "capabilities".
 *
 *  2) An ABSTRACT CLASS (see Vehicle.java)
 *     - A half-built class. Some methods have code, some are left abstract
 *       for subclasses to fill in.
 *     - You CANNOT instantiate it directly (`new Vehicle(...)` is illegal).
 *     - A class can only extend ONE abstract class.
 *
 *  Drivable is an interface — any vehicle that "can be driven" implements it.
 *  Drivers don't care HOW the car starts (electric vs gas) — they just call
 *  `start()`. That's abstraction: hiding implementation behind a contract.
 * ============================================================================
 */
public interface Drivable {

    /** Start the engine / motor / whatever. */
    void start();

    /** Stop the engine. */
    void stop();

    /** Accelerate by the given amount of km/h. */
    void accelerate(int kmh);

    /**
     * Default methods (Java 8+) let interfaces ship a small bit of
     * implementation. Implementers can use this as-is or override it.
     */
    default void honk() {
        System.out.println("    *generic honk* BEEP BEEP!");
    }
}
