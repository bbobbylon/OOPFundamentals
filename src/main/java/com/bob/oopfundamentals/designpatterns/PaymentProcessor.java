package com.bob.oopfundamentals.designpatterns;

/*
 * STRATEGY pattern — make algorithms interchangeable at runtime.
 *
 *  PaymentProcessor doesn't care HOW the payment is made. It just calls
 *  the strategy. Plug in CreditCardStrategy, PayPalStrategy, BitcoinStrategy
 *  — same processor, totally different behavior.
 *
 *  Very common in real codebases. Closely related to Dependency Inversion.
 */
public class PaymentProcessor {

    public interface PaymentStrategy {
        void pay(double amount);
    }

    public static class CreditCardStrategy implements PaymentStrategy {
        private final String cardNumber;
        public CreditCardStrategy(String cardNumber) { this.cardNumber = cardNumber; }
        public void pay(double amount) {
            System.out.println("    [CreditCard] charging $" + amount + " to ****"
                    + cardNumber.substring(cardNumber.length() - 4));
        }
    }

    public static class PayPalStrategy implements PaymentStrategy {
        private final String email;
        public PayPalStrategy(String email) { this.email = email; }
        public void pay(double amount) {
            System.out.println("    [PayPal] charging $" + amount + " to " + email);
        }
    }

    private PaymentStrategy strategy;

    public void setStrategy(PaymentStrategy strategy) { this.strategy = strategy; }

    public void checkout(double amount) {
        if (strategy == null) {
            System.out.println("    [Processor] no payment method selected.");
            return;
        }
        strategy.pay(amount);
    }
}
