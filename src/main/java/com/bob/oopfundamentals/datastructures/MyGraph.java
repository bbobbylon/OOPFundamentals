package com.bob.oopfundamentals.datastructures;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/*
 * ============================================================================
 *  DATA STRUCTURE: GRAPH (adjacency list) + BFS / DFS traversals
 * ============================================================================
 *
 *  A graph is a set of NODES (vertices) connected by EDGES.
 *  Examples: roads (cities connected by highways), social networks (people
 *  connected by friendships), web pages (links between pages).
 *
 *  We store it as an ADJACENCY LIST:
 *      A -> [B, C]
 *      B -> [A, D]
 *      C -> [A]
 *      D -> [B]
 *
 *  Two key traversals:
 *
 *   BFS — Breadth-First Search.
 *     Uses a QUEUE. Visit the start, then all its neighbors, then all THEIR
 *     neighbors, expanding outward in layers. Great for shortest path on
 *     unweighted graphs.
 *
 *   DFS — Depth-First Search.
 *     Uses a STACK (or recursion). Go as deep as you can down one path,
 *     then backtrack. Great for connectivity, cycle detection, topological sort.
 * ============================================================================
 */
public class MyGraph {

    private final Map<String, List<String>> adj = new HashMap<>();

    public void addNode(String name) {
        adj.putIfAbsent(name, new ArrayList<>());
    }

    /** Add an UNDIRECTED edge — appears in both directions. */
    public void addEdge(String a, String b) {
        addNode(a);
        addNode(b);
        adj.get(a).add(b);
        adj.get(b).add(a);
    }

    /** BFS prints nodes in the order they're discovered, layer by layer. */
    public void bfs(String start) {
        Set<String> visited = new HashSet<>();
        Deque<String> queue = new ArrayDeque<>();   // FIFO queue
        queue.add(start);
        visited.add(start);
        System.out.println("    [BFS from " + start + "]");

        while (!queue.isEmpty()) {
            String current = queue.poll();           // remove from FRONT
            System.out.println("      visit " + current + "  (queue now " + queue + ")");
            for (String neighbor : adj.getOrDefault(current, List.of())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.add(neighbor);             // add to BACK
                }
            }
        }
    }

    /** DFS using recursion (which is implicitly a stack via the call stack). */
    public void dfs(String start) {
        Set<String> visited = new HashSet<>();
        System.out.println("    [DFS from " + start + "]");
        dfsRec(start, visited, 0);
    }

    private void dfsRec(String node, Set<String> visited, int depth) {
        if (visited.contains(node)) return;
        visited.add(node);
        System.out.println("    " + "  ".repeat(depth) + "  visit " + node);
        for (String neighbor : adj.getOrDefault(node, List.of())) {
            dfsRec(neighbor, visited, depth + 1);
        }
    }
}
