package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.solid.D_DependencyInversion;
import com.bob.oopfundamentals.solid.I_InterfaceSegregation;
import com.bob.oopfundamentals.solid.L_LiskovSubstitution;
import com.bob.oopfundamentals.solid.O_OpenClosed;
import com.bob.oopfundamentals.solid.S_SingleResponsibility;

public class SolidDemo {

    public static void run() {
        Section.header("7) SOLID PRINCIPLES",
                "Five design rules every entry-level dev is expected to recognize.");

        Section.subheader("S — Single Responsibility");
        S_SingleResponsibility.demo();

        Section.subheader("O — Open/Closed");
        O_OpenClosed.demo();

        Section.subheader("L — Liskov Substitution");
        L_LiskovSubstitution.demo();

        Section.subheader("I — Interface Segregation");
        I_InterfaceSegregation.demo();

        Section.subheader("D — Dependency Inversion");
        D_DependencyInversion.demo();

        Section.takeaway(
                "S — one class, one job.",
                "O — extend with NEW code, don't edit OLD code.",
                "L — subclasses must honor the parent's contract.",
                "I — many small interfaces beat one fat one.",
                "D — depend on interfaces; have concrete classes injected.");
    }
}
