package com.bob.oopfundamentals.datastructures;

/*
 * ============================================================================
 *  DATA STRUCTURE: QUEUE (FIFO — First In, First Out)
 * ============================================================================
 *
 *  Picture a line at a coffee shop. The person who got there FIRST gets
 *  served first. New arrivals join the BACK; the front leaves first.
 *
 *  Operations:
 *      - enqueue(x): add to the back of the line
 *      - dequeue():  remove and return the front of the line
 *      - peek():     look at the front without removing
 *
 *  We back this with a singly linked list because that's the cleanest way
 *  to support O(1) operations at both ends with two pointers (head/tail).
 * ============================================================================
 */
public class MyQueue {

    private static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    private Node head;   // front of the line (dequeue from here)
    private Node tail;   // back of the line  (enqueue here)
    private int size;

    public MyQueue() {
        head = null;
        tail = null;
        size = 0;
    }

    public void enqueue(int value) {
        Node newNode = new Node(value);
        if (tail == null) {
            // First ever element: it's both head AND tail.
            head = newNode;
            tail = newNode;
        } else {
            tail.next = newNode;   // link old tail to new node
            tail = newNode;        // new node is now the tail
        }
        size = size + 1;
        System.out.println("    [Queue] enqueue(" + value + ") -> size " + size + " | " + render());
    }

    public int dequeue() {
        if (head == null) {
            throw new IllegalStateException("Queue is empty — cannot dequeue.");
        }
        int value = head.value;
        head = head.next;
        if (head == null) {
            // We just removed the last element — tail must also reset.
            tail = null;
        }
        size = size - 1;
        System.out.println("    [Queue] dequeue() -> got " + value + " | size " + size + " | " + render());
        return value;
    }

    public int peek() {
        if (head == null) throw new IllegalStateException("Queue is empty.");
        return head.value;
    }

    public int size() { return size; }

    public String render() {
        StringBuilder sb = new StringBuilder("front -> [");
        Node current = head;
        while (current != null) {
            sb.append(current.value);
            if (current.next != null) sb.append(", ");
            current = current.next;
        }
        sb.append("] <- back");
        return sb.toString();
    }
}
