package com.bob.oopfundamentals;

/*
 * Entry point.
 *
 * NOTE: The pom is configured for Spring Boot 4 with a lot of starters
 * (security, data, batch, Spring AI, etc.) that all expect databases / API
 * keys / etc. at boot time. Since this project is a learning demo for the
 * OOP fundamentals — NOT a Spring app — we deliberately bypass Spring and
 * just call our demo runner directly. Plain `public static void main`,
 * plain Java. That keeps the focus exactly where it belongs.
 */
public class OopFundamentalsApplication {

    public static void main(String[] args) throws Exception {
        OopDemoRunner.runAll();
    }
}
