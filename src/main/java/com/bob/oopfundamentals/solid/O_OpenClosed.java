package com.bob.oopfundamentals.solid;

/*
 * O — OPEN/CLOSED PRINCIPLE
 *   "Open for extension, closed for modification."
 *
 *  You should be able to ADD new behavior by writing new code, without
 *  having to EDIT the existing code (which risks breaking things).
 *
 *  Bad:  `if (shape == "circle") ... else if (shape == "square") ...`
 *        Every new shape forces you to crack open this method.
 *
 *  Good: define a Discount interface; add new discount types by writing
 *        a new class. The pricing engine never changes.
 */
public class O_OpenClosed {

    /** The "closed" core abstraction: every discount obeys this contract. */
    public interface Discount {
        double apply(double price);
    }

    public static class NoDiscount implements Discount {
        public double apply(double price) { return price; }
    }

    public static class PercentDiscount implements Discount {
        private final double percent;
        public PercentDiscount(double percent) { this.percent = percent; }
        public double apply(double price) { return price * (1.0 - percent); }
    }

    /** Brand new discount type added LATER without touching the engine. */
    public static class BlackFridayDiscount implements Discount {
        public double apply(double price) { return price - 20.0; }
    }

    /** Pricing engine: never needs to change, no matter how many discounts we add. */
    public static double finalPrice(double basePrice, Discount discount) {
        return discount.apply(basePrice);
    }

    public static void demo() {
        System.out.println("    base $100 + NoDiscount       = $" + finalPrice(100, new NoDiscount()));
        System.out.println("    base $100 + PercentDiscount  = $" + finalPrice(100, new PercentDiscount(0.15)));
        System.out.println("    base $100 + BlackFriday      = $" + finalPrice(100, new BlackFridayDiscount()));
        System.out.println("    -> Adding new behavior = writing a new class, NOT editing the engine.");
    }
}
