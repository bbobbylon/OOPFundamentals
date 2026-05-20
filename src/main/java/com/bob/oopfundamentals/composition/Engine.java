package com.bob.oopfundamentals.composition;

public class Engine {
    private final int horsepower;
    private boolean running;

    public Engine(int horsepower) { this.horsepower = horsepower; }

    public void start() {
        running = true;
        System.out.println("    [Engine] " + horsepower + " hp engine started.");
    }

    public void stop() {
        running = false;
        System.out.println("    [Engine] engine stopped.");
    }

    public boolean isRunning() { return running; }
}
