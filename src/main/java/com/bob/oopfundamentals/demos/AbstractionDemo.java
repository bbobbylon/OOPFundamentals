package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.abstraction.Car;
import com.bob.oopfundamentals.abstraction.Drivable;
import com.bob.oopfundamentals.abstraction.Motorcycle;
import com.bob.oopfundamentals.abstraction.Vehicle;

public class AbstractionDemo {

    public static void run() {
        Section.header("4) ABSTRACTION",
                "Expose WHAT something does; hide HOW it does it.");

        System.out.println(">> Step 1: build a Car and a Motorcycle. Note we CAN'T do `new Vehicle(...)` —");
        System.out.println("   Vehicle is abstract. We must build a concrete subclass.");
        Car car = new Car("Honda Civic", 4);
        Motorcycle moto = new Motorcycle("Harley-Davidson", false);

        Section.subheader("Each vehicle starts differently — that's the HOW being hidden.");
        car.start();
        moto.start();

        Section.subheader("...but the rest of the API (accelerate/stop) is shared via the abstract parent.");
        car.accelerate(40);
        moto.accelerate(60);
        car.honk();    // Car overrides honk()
        moto.honk();   // Motorcycle does NOT — falls back to the interface DEFAULT
        car.stop();

        Section.subheader("The power of abstraction: code against the INTERFACE, not the concrete type.");
        System.out.println(">> Build a small fleet typed as Drivable. Caller doesn't know or care what each is.");
        Drivable[] fleet = new Drivable[] { car, moto };
        for (Drivable d : fleet) {
            // We're calling methods on an abstract idea ("a thing that can be driven")
            // — Java dispatches to the real implementation behind it.
            d.start();
            d.accelerate(10);
            d.stop();
        }

        Section.subheader("Calling describe() — the abstract method each subclass had to implement.");
        for (Vehicle v : new Vehicle[] { car, moto }) {
            v.describe();
        }

        Section.takeaway(
                "Drivable is an INTERFACE — a pure contract ('you MUST have start/stop/...').",
                "Vehicle is an ABSTRACT CLASS — a half-built parent with shared fields and",
                "code, but holes (`abstract` methods) that subclasses must fill in.",
                "Together they let us program against IDEAS (Drivable, Vehicle) without",
                "tying ourselves to a specific concrete class (Car, Motorcycle).");
    }
}
