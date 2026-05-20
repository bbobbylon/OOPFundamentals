package com.bob.oopfundamentals.exceptions;

/**
 * CUSTOM (CHECKED) EXCEPTION.
 *
 * Extending Exception (instead of RuntimeException) makes this CHECKED —
 * the compiler forces callers to either catch it or declare `throws` it.
 * Use checked exceptions for predictable, recoverable error cases.
 */
public class InsufficientFundsException extends Exception {

    private final double shortfall;

    public InsufficientFundsException(double shortfall) {
        super("Insufficient funds — short by $" + shortfall);
        this.shortfall = shortfall;
    }

    public double getShortfall() { return shortfall; }
}
