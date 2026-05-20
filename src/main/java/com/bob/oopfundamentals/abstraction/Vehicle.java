package com.bob.oopfundamentals.abstraction;

/*
 * Vehicle is an ABSTRACT class.
 *
 *   - It has some SHARED implementation (the speed field, accelerate(), stop()).
 *   - It leaves `start()` and `describe()` for subclasses to implement — the
 *     `abstract` keyword on a method means "no body here, fill me in below."
 *   - Because of those abstract methods, you can't do `new Vehicle(...)`. You
 *     must build a Car, Motorcycle, etc.
 *
 *  Notice that Vehicle ALSO implements the Drivable interface. So:
 *      "Every Vehicle is a Drivable. Subclasses inherit the contract."
 *
 *  This is abstraction layered on inheritance: callers can hold a `Drivable`
 *  variable, never knowing it's actually a Motorcycle, and still drive it.
 */
public abstract class Vehicle implements Drivable {

    protected final String model;
    protected int currentSpeedKmh;
    protected boolean running;

    protected Vehicle(String model) {
        this.model = model;
        this.currentSpeedKmh = 0;
        this.running = false;
    }

    // -- Abstract methods: each subclass MUST implement these -----------------

    /** "How do I start?" depends on the kind of vehicle — leave it abstract. */
    @Override
    public abstract void start();

    /** Each subclass prints its own description with its own details. */
    public abstract void describe();

    // -- Concrete (shared) methods --------------------------------------------

    @Override
    public void stop() {
        running = false;
        currentSpeedKmh = 0;
        System.out.println("    " + model + " has stopped. Speed = 0 km/h.");
    }

    @Override
    public void accelerate(int kmh) {
        if (!running) {
            System.out.println("    " + model + " can't accelerate — it's not running.");
            return;
        }
        int oldSpeed = currentSpeedKmh;
        currentSpeedKmh = currentSpeedKmh + kmh;
        System.out.println("    " + model + " accelerated: "
                + oldSpeed + " km/h -> " + currentSpeedKmh + " km/h.");
    }

    public String getModel() { return model; }
    public int getCurrentSpeedKmh() { return currentSpeedKmh; }
    public boolean isRunning() { return running; }
}
