package com.bob.oopfundamentals.datastructures;

/*
 * ============================================================================
 *  DATA STRUCTURE: BINARY SEARCH TREE (BST)
 * ============================================================================
 *
 *  A tree of Nodes where each node has up to TWO children: `left` and `right`.
 *  The BST rule:
 *      - everything in the LEFT subtree is SMALLER than the node
 *      - everything in the RIGHT subtree is BIGGER
 *
 *  Visual: insert 50, 30, 70, 20, 40, 60, 80 in order:
 *
 *               50
 *              /  \
 *            30    70
 *           /  \   / \
 *          20  40 60  80
 *
 *  Why? Searching is fast — at each step you discard half the tree. That's
 *  O(log n) on a balanced tree, similar to binary search on a sorted array,
 *  but the tree also supports cheap insertion.
 *
 *  We also include an "in-order traversal" — visiting left, then node, then
 *  right gives you the values back in SORTED ORDER. Magic!
 * ============================================================================
 */
public class MyBinarySearchTree {

    private static class Node {
        int value;
        Node left;
        Node right;
        Node(int value) { this.value = value; }
    }

    private Node root;

    /** Insert a value. We just recurse: smaller-> left, bigger -> right. */
    public void insert(int value) {
        root = insertRec(root, value, 0);
    }

    private Node insertRec(Node node, int value, int depth) {
        if (node == null) {
            System.out.println("    [BST] insert " + value + " -> placed at depth " + depth);
            return new Node(value);
        }
        if (value < node.value) {
            System.out.println("    [BST] " + value + " < " + node.value + " -> go LEFT");
            node.left = insertRec(node.left, value, depth + 1);
        } else if (value > node.value) {
            System.out.println("    [BST] " + value + " > " + node.value + " -> go RIGHT");
            node.right = insertRec(node.right, value, depth + 1);
        } else {
            System.out.println("    [BST] " + value + " already in tree, skipping.");
        }
        return node;
    }

    /** Look up a value, narrating the path. */
    public boolean contains(int value) {
        Node current = root;
        int steps = 0;
        while (current != null) {
            steps = steps + 1;
            if (value == current.value) {
                System.out.println("    [BST] contains(" + value + ") -> FOUND in " + steps + " step(s).");
                return true;
            }
            if (value < current.value) {
                System.out.println("    [BST] " + value + " < " + current.value + ", search LEFT.");
                current = current.left;
            } else {
                System.out.println("    [BST] " + value + " > " + current.value + ", search RIGHT.");
                current = current.right;
            }
        }
        System.out.println("    [BST] contains(" + value + ") -> NOT found after " + steps + " step(s).");
        return false;
    }

    /** In-order = left, node, right. For a BST this returns sorted order. */
    public String inOrder() {
        StringBuilder sb = new StringBuilder();
        inOrderRec(root, sb);
        return sb.toString().trim();
    }

    private void inOrderRec(Node node, StringBuilder sb) {
        if (node == null) return;
        inOrderRec(node.left, sb);
        sb.append(node.value).append(' ');
        inOrderRec(node.right, sb);
    }
}
