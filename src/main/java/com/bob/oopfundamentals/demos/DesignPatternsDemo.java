package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.designpatterns.AppSettings;
import com.bob.oopfundamentals.designpatterns.NewsAgency;
import com.bob.oopfundamentals.designpatterns.PaymentProcessor;
import com.bob.oopfundamentals.designpatterns.Pizza;
import com.bob.oopfundamentals.designpatterns.ShapeFactory;
import com.bob.oopfundamentals.polymorphism.Shape;

public class DesignPatternsDemo {

    public static void run() {
        Section.header("14) DESIGN PATTERNS",
                "Reusable solutions to common problems — interviewers love these.");

        Section.subheader("Singleton — exactly one instance");
        AppSettings s1 = AppSettings.getInstance();
        AppSettings s2 = AppSettings.getInstance();
        s1.setTheme("light");
        System.out.println("    s1 == s2 ? " + (s1 == s2) + "  (the SAME object)");
        System.out.println("    s2.getTheme() = " + s2.getTheme()
                + "  (s1's mutation visible through s2 because they ARE the same)");

        Section.subheader("Factory — caller asks for a thing, factory builds it");
        ShapeFactory factory = new ShapeFactory();
        Shape circle = factory.create("circle", 5);
        Shape rect   = factory.create("rectangle", 3, 4);
        System.out.println("    factory built: " + circle.getName() + " (area " + circle.area() + ")");
        System.out.println("    factory built: " + rect.getName() + " (area " + rect.area() + ")");

        Section.subheader("Builder — fluent construction of complex objects");
        Pizza pizza = new Pizza.Builder("Large")
                .cheese()
                .pepperoni()
                .thinCrust()
                .build();
        System.out.println("    built: " + pizza);

        Section.subheader("Observer — subject notifies many subscribers");
        NewsAgency agency = new NewsAgency();
        NewsAgency.Subscriber phone = h -> System.out.println("    [phone]  push: " + h);
        NewsAgency.Subscriber email = h -> System.out.println("    [email]  digest: " + h);
        agency.subscribe(phone);
        agency.subscribe(email);
        agency.publish("Java 25 released!");

        Section.subheader("Strategy — same processor, swap algorithms at runtime");
        PaymentProcessor processor = new PaymentProcessor();
        processor.setStrategy(new PaymentProcessor.CreditCardStrategy("4111111111111234"));
        processor.checkout(49.99);
        processor.setStrategy(new PaymentProcessor.PayPalStrategy("bobby@example.com"));
        processor.checkout(49.99);

        Section.takeaway(
                "Singleton — one instance class-wide (use sparingly).",
                "Factory   — hide which concrete class is built.",
                "Builder   — readable construction for many optional fields.",
                "Observer  — pub/sub: subject notifies registered subscribers.",
                "Strategy  — plug in different algorithms behind one interface.");
    }
}
