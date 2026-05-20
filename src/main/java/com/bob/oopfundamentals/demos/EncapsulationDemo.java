package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.encapsulation.BankAccount;

public class EncapsulationDemo {

    public static void run() {
        Section.header("1) ENCAPSULATION",
                "Hide data behind methods that enforce the rules.");

        System.out.println(">> Step 1: create a BankAccount via its constructor.");
        BankAccount account = new BankAccount("Bobby", 100.00, "1234");

        System.out.println("\n>> Step 2: read the public-facing data (allowed).");
        System.out.println("    accountHolder = " + account.getAccountHolder());
        System.out.println("    balance       = $" + account.getBalance());

        System.out.println("\n>> Step 3: try to deposit a VALID amount.");
        account.deposit(50.00);

        System.out.println("\n>> Step 4: try to deposit an INVALID amount. The class refuses.");
        account.deposit(-25.00);

        System.out.println("\n>> Step 5: try a withdrawal with the WRONG pin.");
        account.withdraw(20.00, "0000");

        System.out.println("\n>> Step 6: same withdrawal with the RIGHT pin.");
        account.withdraw(20.00, "1234");

        System.out.println("\n>> Step 7: try to over-withdraw — the rule blocks it.");
        account.withdraw(10_000.00, "1234");

        System.out.println("\n>> Step 8: change the PIN (note: requires the old one).");
        account.changePin("wrong", "9999");   // rejected
        account.changePin("1234", "9999");    // accepted

        System.out.println("\n>> Final state:");
        System.out.println("    balance           = $" + account.getBalance());
        System.out.println("    transactionCount  = " + account.getTransactionCount());

        Section.takeaway(
                "The BankAccount enforces its OWN rules. Outside code can't write",
                "to `balance` directly — it must go through deposit/withdraw, which",
                "validate every change. That's the whole point of encapsulation:",
                "the object owns its data and its invariants.");
    }
}
