package com.bob.oopfundamentals.objectessentials;

/*
 * IMMUTABILITY — once created, never changes.
 *
 *  Rules for a truly immutable class:
 *    1) All fields `private final`.
 *    2) No setters. The class must NEVER expose mutation.
 *    3) "Modification" methods return a NEW instance instead of mutating.
 *    4) The class itself is often marked `final` so subclasses can't break immutability.
 *
 *  Why? Immutable objects are inherently thread-safe, easy to reason about,
 *  and safe to use as Map keys. String, Integer, BigDecimal, LocalDate are
 *  all immutable for these reasons.
 */
public final class Money {

    private final long cents;        // store cents to avoid floating-point drift
    private final String currency;

    public Money(long cents, String currency) {
        this.cents = cents;
        this.currency = currency;
    }

    public long cents()      { return cents; }
    public String currency() { return currency; }

    /** "Adding" does NOT mutate; it builds and returns a brand new Money. */
    public Money plus(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch.");
        }
        return new Money(this.cents + other.cents, currency);
    }

    @Override
    public String toString() {
        return String.format("%s%d.%02d", currency, cents / 100, Math.abs(cents % 100));
    }
}
