package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.datastructures.MyGraph;

public class GraphDemo {

    public static void run() {
        Section.header("19) GRAPHS — BFS & DFS",
                "Nodes and edges. Two essential traversals for interviews.");

        /*
         *  Build this little graph:
         *
         *      A --- B
         *      |     |
         *      C --- D --- E
         *            |
         *            F
         */
        MyGraph g = new MyGraph();
        g.addEdge("A", "B");
        g.addEdge("A", "C");
        g.addEdge("B", "D");
        g.addEdge("C", "D");
        g.addEdge("D", "E");
        g.addEdge("D", "F");

        Section.subheader("BFS — uses a queue. Visits in layers.");
        g.bfs("A");

        Section.subheader("DFS — uses recursion. Goes deep before going wide.");
        g.dfs("A");

        Section.takeaway(
                "Graphs are everywhere: social networks, maps, web pages, dependencies.",
                "BFS = queue, layer-by-layer, finds shortest path in unweighted graphs.",
                "DFS = stack/recursion, deep-first, used for connectivity and cycles.");
    }
}
