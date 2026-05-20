package com.bob.oopfundamentals.datastructures;

/*
 * ============================================================================
 *  DATA STRUCTURE: SINGLY LINKED LIST
 * ============================================================================
 *
 *  A linked list is a chain of "Nodes". Each Node holds:
 *      - a piece of data (here, an int `value`)
 *      - a reference (a "pointer") to the NEXT node in the chain
 *
 *  Picture it like a treasure hunt:
 *      head -> [10|*] -> [20|*] -> [30|*] -> [40|null]
 *      Each box knows about the next; the last one points to null = "end".
 *
 *  WHY use a linked list instead of an array?
 *      - Arrays are fast for INDEX access but slow for inserting at the front.
 *      - Linked lists are O(1) to insert at the head, but O(n) to find item #5.
 *      - So: trade-offs. Different structures suit different workloads.
 *
 *  This class only handles ints to keep the focus on the structure itself.
 * ============================================================================
 */
public class MyLinkedList {

    /**
     * The inner Node class. It's `static` because each Node is independent —
     * it doesn't need a reference to the outer list to do its job.
     */
    private static class Node {
        int value;        // the data this node carries
        Node next;        // the link to the next node (or null if last)

        Node(int value) {
            this.value = value;
            this.next = null;
        }
    }

    private Node head;    // the first node — the "entry point" into the list
    private int size;     // how many nodes are in the list right now

    public MyLinkedList() {
        this.head = null;
        this.size = 0;
    }

    /** Adds a value to the END of the list. O(n) because we walk to the tail. */
    public void add(int value) {
        Node newNode = new Node(value);
        size = size + 1;

        if (head == null) {
            head = newNode;
            System.out.println("    [LinkedList] add(" + value + ") -> list was empty, this becomes head.");
            return;
        }
        // Walk from head until we find the last node (next == null).
        Node current = head;
        int hops = 0;
        while (current.next != null) {
            current = current.next;
            hops = hops + 1;
        }
        current.next = newNode;
        System.out.println("    [LinkedList] add(" + value + ") -> walked " + hops + " hops, appended at tail.");
    }

    /** Adds a value at the FRONT. O(1) — this is what linked lists are great at. */
    public void addFirst(int value) {
        Node newNode = new Node(value);
        newNode.next = head;   // new node points at the old head
        head = newNode;        // and now IT is the head
        size = size + 1;
        System.out.println("    [LinkedList] addFirst(" + value + ") -> O(1), new head.");
    }

    /** Removes the first node whose value matches. Returns true if found. */
    public boolean remove(int value) {
        if (head == null) {
            return false;
        }
        // Case 1: the head itself matches — just skip past it.
        if (head.value == value) {
            head = head.next;
            size = size - 1;
            System.out.println("    [LinkedList] remove(" + value + ") -> removed head node.");
            return true;
        }
        // Case 2: walk the chain looking for a node whose NEXT is the target.
        Node current = head;
        while (current.next != null && current.next.value != value) {
            current = current.next;
        }
        if (current.next == null) {
            System.out.println("    [LinkedList] remove(" + value + ") -> not found.");
            return false;
        }
        // "Unlink" the target by pointing around it.
        current.next = current.next.next;
        size = size - 1;
        System.out.println("    [LinkedList] remove(" + value + ") -> unlinked from chain.");
        return true;
    }

    public int size() { return size; }

    /** Renders the list as "10 -> 20 -> 30 -> null" so you can SEE the chain. */
    public String render() {
        StringBuilder sb = new StringBuilder();
        Node current = head;
        while (current != null) {
            sb.append(current.value).append(" -> ");
            current = current.next;
        }
        sb.append("null");
        return sb.toString();
    }
}
