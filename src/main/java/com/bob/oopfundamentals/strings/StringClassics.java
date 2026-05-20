package com.bob.oopfundamentals.strings;

import java.util.HashMap;
import java.util.Map;

/*
 * Classic string-manipulation interview problems. Practice these — they're
 * extremely common in entry-level coding screens.
 */
public class StringClassics {

    /** Reverse the characters of a string. "hello" -> "olleh". */
    public static String reverse(String s) {
        char[] chars = s.toCharArray();
        int i = 0, j = chars.length - 1;
        while (i < j) {
            char tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
            i++;
            j--;
        }
        return new String(chars);
    }

    /**
     * Palindrome check — reads the same forwards and backwards.
     * "racecar" -> true, "hello" -> false.
     * We ignore case and non-letter characters so "A man, a plan, a canal: Panama" works.
     */
    public static boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) {
                return false;
            }
            i++;
            j--;
        }
        return true;
    }

    /**
     * Anagram check — same letters, possibly rearranged.
     * "listen" / "silent" -> true.
     * Trick: count chars in one string, subtract for the other; all counts -> 0.
     */
    public static boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] counts = new int[26];                 // assume lowercase letters
        for (int i = 0; i < a.length(); i++) {
            counts[a.charAt(i) - 'a']++;
            counts[b.charAt(i) - 'a']--;
        }
        for (int c : counts) if (c != 0) return false;
        return true;
    }

    /**
     * First non-repeating character. "leetcode" -> 'l'.
     * Pass 1: count occurrences. Pass 2: find first with count == 1.
     */
    public static Character firstUniqueChar(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            counts.merge(c, 1, Integer::sum);
        }
        for (int i = 0; i < s.length(); i++) {
            if (counts.get(s.charAt(i)) == 1) {
                return s.charAt(i);
            }
        }
        return null;   // none found
    }
}
