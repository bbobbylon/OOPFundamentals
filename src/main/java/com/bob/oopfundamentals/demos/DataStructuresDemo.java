package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.datastructures.MyBinarySearchTree;
import com.bob.oopfundamentals.datastructures.MyLinkedList;
import com.bob.oopfundamentals.datastructures.MyQueue;
import com.bob.oopfundamentals.datastructures.MyStack;

public class DataStructuresDemo {

    public static void run() {
        Section.header("5) DATA STRUCTURES",
                "Different shapes of memory for different jobs.");

        // ------------------- LINKED LIST -------------------
        Section.subheader("LinkedList (a chain of nodes)");
        MyLinkedList list = new MyLinkedList();
        list.add(10);          // append to tail
        list.add(20);
        list.add(30);
        list.addFirst(5);      // O(1) at the head
        System.out.println("    list now: " + list.render() + "  (size " + list.size() + ")");
        list.remove(20);
        System.out.println("    after remove(20): " + list.render());

        // ------------------- STACK -------------------
        Section.subheader("Stack (LIFO — last in, first out)");
        MyStack stack = new MyStack();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println("    stack now: " + stack.render());
        System.out.println("    peek() = " + stack.peek() + "  (the last pushed)");
        stack.pop();
        stack.pop();
        System.out.println("    stack after 2 pops: " + stack.render());

        // ------------------- QUEUE -------------------
        Section.subheader("Queue (FIFO — first in, first out)");
        MyQueue queue = new MyQueue();
        queue.enqueue(100);
        queue.enqueue(200);
        queue.enqueue(300);
        queue.dequeue();
        queue.dequeue();
        System.out.println("    queue now: " + queue.render() + "  (size " + queue.size() + ")");

        // ------------------- BST -------------------
        Section.subheader("Binary Search Tree (sorted tree for fast lookup)");
        MyBinarySearchTree bst = new MyBinarySearchTree();
        int[] toInsert = {50, 30, 70, 20, 40, 60, 80};
        System.out.println(">> Inserting in order: 50, 30, 70, 20, 40, 60, 80");
        for (int v : toInsert) {
            bst.insert(v);
        }
        System.out.println();
        System.out.println(">> Searching for 40 (exists):");
        bst.contains(40);
        System.out.println();
        System.out.println(">> Searching for 99 (does not exist):");
        bst.contains(99);
        System.out.println();
        System.out.println(">> In-order traversal (left, root, right) — gives sorted order:");
        System.out.println("    " + bst.inOrder());

        Section.takeaway(
                "Same data, different containers. Each structure favors different ops:",
                "  LinkedList: cheap to add/remove at the ends; slow random access.",
                "  Stack:      LIFO — undo, call stacks, bracket matching.",
                "  Queue:      FIFO — task queues, fair scheduling.",
                "  BST:        sorted by design; fast search/insert on balanced trees.");
    }
}
