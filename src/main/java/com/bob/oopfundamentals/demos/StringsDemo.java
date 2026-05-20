package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.strings.StringClassics;

public class StringsDemo {

    public static void run() {
        Section.header("17) STRING CLASSICS",
                "The string puzzles that show up in entry-level coding screens.");

        Section.subheader("Reverse a string");
        System.out.println("    reverse('hello')   = " + StringClassics.reverse("hello"));
        System.out.println("    reverse('OOP')     = " + StringClassics.reverse("OOP"));

        Section.subheader("Palindrome check");
        String[] cases = {"racecar", "hello", "A man, a plan, a canal: Panama"};
        for (String c : cases) {
            System.out.println("    isPalindrome('" + c + "') = " + StringClassics.isPalindrome(c));
        }

        Section.subheader("Anagram check");
        System.out.println("    isAnagram('listen', 'silent') = " + StringClassics.isAnagram("listen", "silent"));
        System.out.println("    isAnagram('hello', 'world')   = " + StringClassics.isAnagram("hello", "world"));

        Section.subheader("First non-repeating character");
        System.out.println("    firstUniqueChar('leetcode')   = " + StringClassics.firstUniqueChar("leetcode"));
        System.out.println("    firstUniqueChar('aabbcc')     = " + StringClassics.firstUniqueChar("aabbcc"));

        Section.takeaway(
                "Two-pointer technique (start + end moving inward) handles many string",
                "and array problems efficiently. HashMap is the go-to for counting things.",
                "Practice these patterns until they're muscle memory.");
    }
}
