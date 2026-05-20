package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.composition.ComposedCar;
import com.bob.oopfundamentals.composition.Engine;
import com.bob.oopfundamentals.composition.GpsModule;

public class CompositionDemo {

    public static void run() {
        Section.header("8) COMPOSITION OVER INHERITANCE",
                "Build classes by COMBINING parts, not by extending a single tree.");

        Engine v8 = new Engine(450);
        GpsModule gps = new GpsModule();
        ComposedCar car = new ComposedCar(v8, gps);

        car.navigate("Home", "Work");   // engine off — rejected
        car.start();
        car.navigate("Home", "Work");   // engine on — works
        car.stop();

        Section.subheader("Swapping a part — same Car class, different Engine, zero edits.");
        Engine electric = new Engine(300);
        ComposedCar tesla = new ComposedCar(electric, new GpsModule());
        tesla.start();
        tesla.navigate("San Francisco", "Los Angeles");

        Section.takeaway(
                "Composition is flexible: swap Engine for ElectricEngine without subclassing.",
                "Java only allows extending ONE class, but you can compose many parts.",
                "Most modern code (and Spring DI) leans heavily on composition.");
    }
}
