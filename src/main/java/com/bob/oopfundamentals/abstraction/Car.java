package com.bob.oopfundamentals.abstraction;

public class Car extends Vehicle {

    private final int numberOfDoors;

    public Car(String model, int numberOfDoors) {
        super(model);
        this.numberOfDoors = numberOfDoors;
    }

    /** Fills in the abstract start() from Vehicle. */
    @Override
    public void start() {
        running = true;
        System.out.println("    " + model + " (car) starts with a key-turn: vroom!");
    }

    @Override
    public void describe() {
        System.out.println("    Car: " + model + " | doors: " + numberOfDoors
                + " | running: " + running + " | speed: " + currentSpeedKmh + " km/h");
    }

    @Override
    public void honk() {
        System.out.println("    " + model + " honks: HONK HONK!");
    }
}
