package com.bob.oopfundamentals.solid;

/*
 * S — SINGLE RESPONSIBILITY PRINCIPLE
 *   "A class should have ONE reason to change."
 *
 *  Bad:  one class that does Invoice math AND prints AND saves to a DB.
 *        Three different reasons it could need editing -> three responsibilities.
 *
 *  Good: split into three classes — each with one job. If the report format
 *        changes, only InvoicePrinter changes. If storage changes, only
 *        InvoiceRepository changes. The math stays untouched.
 *
 *  Below: we show the "good" version. Each class has a single, focused job.
 */
public class S_SingleResponsibility {

    /** Just holds invoice data and computes totals. */
    public static class Invoice {
        private final double amount;
        private final double taxRate;

        public Invoice(double amount, double taxRate) {
            this.amount = amount;
            this.taxRate = taxRate;
        }
        public double getAmount() { return amount; }
        public double total() { return amount + amount * taxRate; }
    }

    /** Just prints. Doesn't compute, doesn't save. */
    public static class InvoicePrinter {
        public void print(Invoice inv) {
            System.out.println("    [Printer] Total due: $" + inv.total());
        }
    }

    /** Just persists. Doesn't compute or format. (Pretend DB call.) */
    public static class InvoiceRepository {
        public void save(Invoice inv) {
            System.out.println("    [Repository] Saving invoice for $" + inv.getAmount() + " to DB...");
        }
    }

    public static void demo() {
        Invoice inv = new Invoice(100.0, 0.10);
        new InvoicePrinter().print(inv);
        new InvoiceRepository().save(inv);
        System.out.println("    -> Three classes, three jobs. Change one without touching the others.");
    }
}
