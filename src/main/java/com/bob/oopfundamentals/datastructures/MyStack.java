package com.bob.oopfundamentals.datastructures;

import java.util.Arrays;

/*
 * ============================================================================
 *  DATA STRUCTURE: STACK (LIFO — Last In, First Out)
 * ============================================================================
 *
 *  Picture a stack of plates. You can only:
 *      - push() a plate on TOP
 *      - pop() the TOP plate off
 *      - peek() at the TOP plate without removing it
 *
 *  The plate you put on LAST is the one you take off FIRST.
 *  That's why we say "LIFO".
 *
 *  Real-world uses:
 *      - the call stack (which is literally how function calls work)
 *      - Ctrl+Z undo history
 *      - matching brackets in a parser
 *
 *  Under the hood we use a simple int[] that grows when needed.
 * ============================================================================
 */
public class MyStack {

    private int[] data;
    private int top;        // index of the next FREE slot. So top==0 means empty.

    public MyStack() {
        this.data = new int[8];
        this.top = 0;
    }

    /** Add to the top. Grows the backing array if it's full. */
    public void push(int value) {
        if (top == data.length) {
            // Out of room — double the array. (Classic dynamic-array trick.)
            data = Arrays.copyOf(data, data.length * 2);
            System.out.println("    [Stack] backing array grew to " + data.length);
        }
        data[top] = value;
        top = top + 1;
        System.out.println("    [Stack] push(" + value + ") -> top is now index " + top + ", size " + top);
    }

    /** Remove and return the top. Throws if empty. */
    public int pop() {
        if (top == 0) {
            throw new IllegalStateException("Stack is empty — cannot pop.");
        }
        top = top - 1;
        int value = data[top];
        System.out.println("    [Stack] pop() -> got " + value + ", size now " + top);
        return value;
    }

    /** Look at the top without removing. */
    public int peek() {
        if (top == 0) {
            throw new IllegalStateException("Stack is empty — cannot peek.");
        }
        return data[top - 1];
    }

    public int size() { return top; }
    public boolean isEmpty() { return top == 0; }

    public String render() {
        StringBuilder sb = new StringBuilder("[bottom] ");
        for (int i = 0; i < top; i = i + 1) {
            sb.append(data[i]).append(' ');
        }
        sb.append("[top]");
        return sb.toString();
    }
}
