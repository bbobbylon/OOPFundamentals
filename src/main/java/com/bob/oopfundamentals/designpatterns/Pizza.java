package com.bob.oopfundamentals.designpatterns;

/*
 * BUILDER pattern — for constructing objects with LOTS of optional fields
 * without telescoping constructors like:
 *     new Pizza(size, "cheese", true, false, true, "thin", null, ...)
 *
 *  Instead:
 *     new Pizza.Builder("Large").cheese().pepperoni().thinCrust().build();
 *
 *  Reads like English; the Builder enforces required-vs-optional and lets you
 *  add fields without breaking existing call-sites.
 */
public class Pizza {

    private final String size;
    private final boolean cheese;
    private final boolean pepperoni;
    private final boolean mushrooms;
    private final String crust;

    // Private — only the Builder can construct.
    private Pizza(Builder b) {
        this.size      = b.size;
        this.cheese    = b.cheese;
        this.pepperoni = b.pepperoni;
        this.mushrooms = b.mushrooms;
        this.crust     = b.crust;
    }

    @Override
    public String toString() {
        return "Pizza{" + size + ", " + crust + " crust, cheese=" + cheese
                + ", pepperoni=" + pepperoni + ", mushrooms=" + mushrooms + "}";
    }

    public static class Builder {
        private final String size;        // required
        private boolean cheese;            // optional with sensible defaults
        private boolean pepperoni;
        private boolean mushrooms;
        private String crust = "regular";

        public Builder(String size) { this.size = size; }

        public Builder cheese()           { this.cheese = true;       return this; }
        public Builder pepperoni()        { this.pepperoni = true;    return this; }
        public Builder mushrooms()        { this.mushrooms = true;    return this; }
        public Builder thinCrust()        { this.crust = "thin";      return this; }
        public Builder stuffedCrust()     { this.crust = "stuffed";   return this; }

        public Pizza build() { return new Pizza(this); }
    }
}
