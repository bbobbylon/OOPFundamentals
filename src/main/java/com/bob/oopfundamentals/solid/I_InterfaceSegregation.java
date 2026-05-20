package com.bob.oopfundamentals.solid;

/*
 * I — INTERFACE SEGREGATION PRINCIPLE
 *   "Don't force a class to implement methods it doesn't need."
 *
 *  Bad:  one fat interface `Machine { print, scan, fax }`. A simple Printer
 *        is forced to implement scan() and fax() as no-ops or to throw.
 *
 *  Good: split into small, focused interfaces. Each class implements only
 *        what it actually does. Multifunction devices can combine.
 */
public class I_InterfaceSegregation {

    public interface Printer { void print(String doc); }
    public interface Scanner { String scan(); }
    public interface Fax     { void fax(String number, String doc); }

    /** Simple printer — implements only Printer. No fake scan/fax methods. */
    public static class BasicPrinter implements Printer {
        public void print(String doc) { System.out.println("    [BasicPrinter] printing: " + doc); }
    }

    /** Multifunction device — opts in to all three small interfaces. */
    public static class OfficeMachine implements Printer, Scanner, Fax {
        public void print(String doc) { System.out.println("    [OfficeMachine] printing: " + doc); }
        public String scan() {
            System.out.println("    [OfficeMachine] scanning...");
            return "scanned document content";
        }
        public void fax(String number, String doc) {
            System.out.println("    [OfficeMachine] faxing to " + number + ": " + doc);
        }
    }

    public static void demo() {
        Printer simple = new BasicPrinter();
        simple.print("invoice.pdf");

        OfficeMachine combo = new OfficeMachine();
        combo.print("report.pdf");
        String scanned = combo.scan();
        combo.fax("555-1234", scanned);

        System.out.println("    -> Small focused interfaces > one big bloated one. Clients use only what they need.");
    }
}
