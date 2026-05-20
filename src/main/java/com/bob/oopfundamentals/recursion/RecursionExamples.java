package com.bob.oopfundamentals.recursion;

/*
 * RECURSION — a method that calls ITSELF on a smaller version of the problem.
 *
 *  Every recursive function needs TWO things:
 *    1) A BASE CASE — a tiny version we can answer directly (no more recursion).
 *    2) A RECURSIVE STEP — reduce the problem and call ourselves.
 *
 *  Without a base case, recursion runs forever -> StackOverflowError.
 *  Watch the indented prints below to see the call stack growing and shrinking.
 */
public class RecursionExamples {

    /** factorial(n) = n * (n-1) * (n-2) * ... * 1.  E.g. factorial(5) = 120. */
    public static int factorial(int n) {
        String indent = "  ".repeat(5 - Math.min(n, 5));
        System.out.println("    " + indent + "factorial(" + n + ") called");

        if (n <= 1) {                       // BASE CASE
            System.out.println("    " + indent + "  -> base case, return 1");
            return 1;
        }
        int sub = factorial(n - 1);          // RECURSIVE STEP — shrink toward 1
        int result = n * sub;
        System.out.println("    " + indent + "  -> " + n + " * " + sub + " = " + result);
        return result;
    }

    /** fib(n) = fib(n-1) + fib(n-2). Classic — but exponential without memoization. */
    public static int fibonacci(int n) {
        if (n < 2) return n;                 // BASE CASE (0 -> 0, 1 -> 1)
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    /** sumDigits(1234) -> 1+2+3+4 = 10.  Uses % 10 to peel digits off the end. */
    public static int sumDigits(int n) {
        if (n < 10) return n;                // BASE CASE: single digit
        return (n % 10) + sumDigits(n / 10); // last digit + recurse on the rest
    }
}
