package com.bob.oopfundamentals.wildcards;

import java.util.List;

/*
 * GENERIC WILDCARDS — `? extends T` and `? super T`.
 *
 *  These look weird at first. Here's the simple rule (memorize: "PECS"):
 *
 *      Producer  Extends    — if the collection PRODUCES (you READ from it),
 *                              use ? extends T
 *      Consumer  Super      — if the collection CONSUMES (you WRITE to it),
 *                              use ? super T
 *
 *  Why?
 *    - List<? extends Number> = "some specific subtype of Number — unknown which".
 *        We can SAFELY READ Numbers out (we know everything is a Number).
 *        We can NOT add anything (could be List<Integer>, can't add a Double).
 *
 *    - List<? super Integer> = "Integer or some supertype of Integer".
 *        We can SAFELY WRITE Integers in (they fit any supertype list).
 *        We can NOT read anything specific (we only know it's at least Object).
 *
 *  Without wildcards, `List<Number>` would only accept `List<Number>` —
 *  not `List<Integer>`, even though Integer extends Number. Wildcards fix that.
 */
public class WildcardExamples {

    /**
     * UPPER-BOUNDED wildcard. We can sum any list whose elements are
     * Number or a subtype (Integer, Double, Long, BigDecimal, ...).
     *
     * We can READ each element as a Number — that's why this works.
     */
    public static double sumOf(List<? extends Number> numbers) {
        double total = 0;
        for (Number n : numbers) {
            total = total + n.doubleValue();
        }
        return total;
    }

    /**
     * LOWER-BOUNDED wildcard. The list can be List<Integer>, List<Number>,
     * or List<Object>. We can SAFELY add Integer to any of those.
     */
    public static void addIntegers(List<? super Integer> sink, int howMany) {
        for (int i = 1; i <= howMany; i++) {
            sink.add(i);
        }
    }

    /*
     * If the next line were uncommented, it would NOT COMPILE — and that's
     * the whole point of wildcards. The compiler stops us from misusing them.
     *
     *   public static void cannotMixThem(List<? extends Number> nums) {
     *       nums.add(1);   // compile error — could be List<Double>!
     *   }
     */
}
