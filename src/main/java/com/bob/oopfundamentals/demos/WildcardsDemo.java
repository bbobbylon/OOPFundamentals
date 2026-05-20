package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.wildcards.WildcardExamples;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class WildcardsDemo {

    public static void run() {
        Section.header("21) GENERIC WILDCARDS — PECS",
                "? extends T (read from), ? super T (write into).");

        Section.subheader("? extends Number — accepts List<Integer>, List<Double>, ...");
        List<Integer> ints = Arrays.asList(1, 2, 3, 4);
        List<Double> dbls  = Arrays.asList(1.5, 2.5, 3.5);
        System.out.println("    sumOf(List<Integer>) = " + WildcardExamples.sumOf(ints));
        System.out.println("    sumOf(List<Double>)  = " + WildcardExamples.sumOf(dbls));

        Section.subheader("? super Integer — write Integers into List<Integer>, List<Number>, List<Object>");
        List<Integer> intSink = new ArrayList<>();
        List<Number>  numSink = new ArrayList<>();
        List<Object>  objSink = new ArrayList<>();
        WildcardExamples.addIntegers(intSink, 3);
        WildcardExamples.addIntegers(numSink, 3);
        WildcardExamples.addIntegers(objSink, 3);
        System.out.println("    intSink = " + intSink);
        System.out.println("    numSink = " + numSink);
        System.out.println("    objSink = " + objSink);

        Section.takeaway(
                "PECS: Producer Extends, Consumer Super.",
                "  ? extends T   — the source. You READ T's out (safe).",
                "  ? super T     — the sink.   You WRITE T's in (safe).",
                "Wildcards let one method work for whole families of collection types.");
    }
}
