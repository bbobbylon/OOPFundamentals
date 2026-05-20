package com.bob.oopfundamentals.encapsulation;

/*
 * ============================================================================
 *  ENCAPSULATION — "hiding the internals, exposing a safe interface"
 * ============================================================================
 *
 *  The CORE IDEA:
 *    - The fields below (accountHolder, balance, pin) are marked `private`.
 *    - That means *no code outside this class* can read or write them directly.
 *    - The only way in is through the public methods (deposit, withdraw, ...).
 *    - Those methods are the "gatekeepers": they can validate input, reject
 *      bad values, log activity, etc. before changing the internal state.
 *
 *  Why this matters:
 *    Without encapsulation, anyone could write `account.balance = -1000000;`
 *    and corrupt your data. With encapsulation, the class itself ENFORCES
 *    its own rules ("balance can never go below 0", "deposits must be > 0").
 *
 *  Trace this file top-to-bottom — every variable below is annotated so you
 *  can follow exactly what state lives where and who's allowed to touch it.
 * ============================================================================
 */
public class BankAccount {

    // --- PRIVATE FIELDS (internal state — locked away) -----------------------

    /** Name of the person who owns this account. Set once in the constructor. */
    private final String accountHolder;

    /** Current money in the account. Only deposit/withdraw can change this. */
    private double balance;

    /** 4-digit security PIN. Stored privately so no one can read it directly. */
    private String pin;

    /** Counts how many transactions have happened. Useful for an audit trail. */
    private int transactionCount;

    // --- CONSTRUCTOR (the only way to create a valid BankAccount) ------------

    public BankAccount(String accountHolder, double openingDeposit, String pin) {
        // Validate the inputs BEFORE we accept them. This is encapsulation in
        // action: the class refuses to be constructed in an invalid state.
        if (accountHolder == null || accountHolder.isBlank()) {
            throw new IllegalArgumentException("Account holder name is required.");
        }
        if (openingDeposit < 0) {
            throw new IllegalArgumentException("Opening deposit cannot be negative.");
        }
        if (pin == null || pin.length() != 4) {
            throw new IllegalArgumentException("PIN must be exactly 4 characters.");
        }

        this.accountHolder = accountHolder;
        this.balance = openingDeposit;
        this.pin = pin;
        this.transactionCount = 0;

        System.out.println("    [BankAccount] Created account for '" + accountHolder
                + "' with opening balance $" + balance);
    }

    // --- PUBLIC METHODS (the "safe interface" to the outside world) ----------

    /** Anyone can read who owns the account — that's not secret. */
    public String getAccountHolder() {
        return accountHolder;
    }

    /** Anyone can read the balance, but no one can SET it directly. */
    public double getBalance() {
        return balance;
    }

    public int getTransactionCount() {
        return transactionCount;
    }

    /**
     * Deposit money. Notice: the rule "amount must be positive" is enforced
     * HERE, inside the class. Callers can't bypass it.
     */
    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("    [BankAccount] REJECTED deposit of $" + amount
                    + " — amount must be positive.");
            return;
        }
        double oldBalance = balance;          // remember the old value so we can show the change
        balance = balance + amount;           // mutate the private field
        transactionCount = transactionCount + 1;
        System.out.println("    [BankAccount] Deposited $" + amount
                + " | balance: $" + oldBalance + " -> $" + balance);
    }

    /**
     * Withdraw money. Requires the correct PIN AND a sufficient balance.
     * This is a second example of the class enforcing its own invariants.
     */
    public void withdraw(double amount, String enteredPin) {
        if (!pin.equals(enteredPin)) {
            System.out.println("    [BankAccount] REJECTED withdrawal — wrong PIN.");
            return;
        }
        if (amount <= 0) {
            System.out.println("    [BankAccount] REJECTED withdrawal — amount must be positive.");
            return;
        }
        if (amount > balance) {
            System.out.println("    [BankAccount] REJECTED withdrawal of $" + amount
                    + " — insufficient funds (have $" + balance + ").");
            return;
        }
        double oldBalance = balance;
        balance = balance - amount;
        transactionCount = transactionCount + 1;
        System.out.println("    [BankAccount] Withdrew $" + amount
                + " | balance: $" + oldBalance + " -> $" + balance);
    }

    /**
     * Change the PIN. Requires the OLD pin — otherwise anyone could change it.
     * Demonstrates that even "setters" can have rules.
     */
    public void changePin(String oldPin, String newPin) {
        if (!pin.equals(oldPin)) {
            System.out.println("    [BankAccount] REJECTED PIN change — old PIN incorrect.");
            return;
        }
        if (newPin == null || newPin.length() != 4) {
            System.out.println("    [BankAccount] REJECTED PIN change — new PIN must be 4 chars.");
            return;
        }
        pin = newPin;
        System.out.println("    [BankAccount] PIN changed successfully.");
    }
}
