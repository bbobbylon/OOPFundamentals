package com.bob.oopfundamentals.abstraction;

public class Motorcycle extends Vehicle {

    private final boolean hasSideCar;

    public Motorcycle(String model, boolean hasSideCar) {
        super(model);
        this.hasSideCar = hasSideCar;
    }

    @Override
    public void start() {
        running = true;
        System.out.println("    " + model + " (motorcycle) starts with a kick: brrrum!");
    }

    @Override
    public void describe() {
        System.out.println("    Motorcycle: " + model + " | side car: " + hasSideCar
                + " | running: " + running + " | speed: " + currentSpeedKmh + " km/h");
    }

    // Note: we DON'T override honk(), so this class uses the default from
    // the Drivable interface ("*generic honk* BEEP BEEP!"). That's a perfect
    // little example of how interface defaults work.
}
