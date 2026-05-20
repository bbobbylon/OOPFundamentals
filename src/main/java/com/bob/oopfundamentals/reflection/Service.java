package com.bob.oopfundamentals.reflection;

/**
 * A normal class. We mark some methods with our custom @Important annotation
 * so the reflection demo can find them at runtime.
 */
public class Service {

    public String name = "PaymentService";

    public void start() {
        System.out.println("    [Service] starting up...");
    }

    @Important(reason = "billing depends on this")
    public void chargeCustomer(String customer, double amount) {
        System.out.println("    [Service] charging " + customer + " $" + amount);
    }

    @Important(reason = "auditors require this")
    public void writeAuditLog() {
        System.out.println("    [Service] writing audit log...");
    }

    public void stop() {
        System.out.println("    [Service] shutting down.");
    }
}
