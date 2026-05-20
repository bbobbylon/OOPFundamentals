package com.bob.oopfundamentals.exceptions;

public class Wallet {

    private double balance;

    public Wallet(double balance) { this.balance = balance; }

    public double getBalance() { return balance; }

    /**
     * Declares `throws InsufficientFundsException` — that's the checked-exception
     * contract. Callers MUST handle it or pass it up.
     */
    public void spend(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
        System.out.println("    [Wallet] spent $" + amount + ", balance now $" + balance);
    }
}
