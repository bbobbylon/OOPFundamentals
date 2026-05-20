package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.exceptions.InsufficientFundsException;
import com.bob.oopfundamentals.exceptions.Wallet;

public class ExceptionsDemo {

    public static void run() {
        Section.header("10) EXCEPTIONS",
                "Structured error handling: try / catch / finally / throw.");

        Section.subheader("Checked exception — caller MUST handle it.");
        Wallet wallet = new Wallet(50.0);
        try {
            wallet.spend(20);                // ok
            wallet.spend(100);               // throws!
            System.out.println("    (this line is never reached)");
        } catch (InsufficientFundsException ex) {
            System.out.println("    CAUGHT: " + ex.getMessage());
            System.out.println("           shortfall = $" + ex.getShortfall());
        } finally {
            // The `finally` block runs no matter what — exception or not.
            // Great for cleanup (closing files, releasing locks, etc.).
            System.out.println("    [finally] always runs — balance now $" + wallet.getBalance());
        }

        Section.subheader("Unchecked (runtime) exception — no `throws` required.");
        try {
            int[] arr = {1, 2, 3};
            int x = arr[10];   // ArrayIndexOutOfBoundsException — RUNTIME exception
            System.out.println("    never prints: " + x);
        } catch (ArrayIndexOutOfBoundsException ex) {
            System.out.println("    CAUGHT (runtime): " + ex);
        }

        Section.subheader("Multi-catch — handle several exception types together.");
        try {
            String s = null;
            s.length();   // NullPointerException
        } catch (NullPointerException | ArithmeticException ex) {
            System.out.println("    CAUGHT: " + ex.getClass().getSimpleName());
        }

        Section.takeaway(
                "throw     — raise an exception",
                "try       — guard a block where things might go wrong",
                "catch     — handle specific exception types",
                "finally   — cleanup that runs no matter what",
                "CHECKED   = compiler forces you to handle (Exception subclasses)",
                "UNCHECKED = optional to handle  (RuntimeException subclasses)");
    }
}
