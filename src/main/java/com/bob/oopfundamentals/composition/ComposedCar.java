package com.bob.oopfundamentals.composition;

/*
 * ============================================================================
 *  COMPOSITION OVER INHERITANCE
 * ============================================================================
 *
 *  Inheritance models "IS-A":   Dog IS-A Animal.
 *  Composition models "HAS-A":  Car HAS-A Engine, HAS-A GpsModule.
 *
 *  Rule of thumb: when in doubt, prefer composition.
 *
 *  Why?
 *    - Inheritance locks you into the parent's behavior permanently. Change
 *      one method in the parent and you've changed every subclass.
 *    - Composition lets you swap a part (different engine, different GPS)
 *      without touching the rest.
 *    - Java only allows extending ONE class. But you can compose many parts.
 *
 *  This Car HAS an Engine and HAS a GpsModule. It exposes its own API
 *  (start/stop/navigate) by DELEGATING to those parts.
 * ============================================================================
 */
public class ComposedCar {

    private final Engine engine;        // HAS-A engine
    private final GpsModule gps;        // HAS-A GPS

    public ComposedCar(Engine engine, GpsModule gps) {
        this.engine = engine;
        this.gps = gps;
    }

    public void start() { engine.start(); }                // delegate
    public void stop()  { engine.stop();  }                // delegate
    public void navigate(String from, String to) {
        if (!engine.isRunning()) {
            System.out.println("    [Car] start the engine first!");
            return;
        }
        gps.route(from, to);
    }
}
