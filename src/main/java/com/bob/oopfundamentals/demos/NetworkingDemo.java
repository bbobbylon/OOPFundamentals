package com.bob.oopfundamentals.demos;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;

/*
 * NETWORKING — TCP sockets in Java.
 *
 *  THE MENTAL MODEL:
 *    A SERVER binds to a port and waits for connections.
 *    A CLIENT opens a connection to (host, port).
 *    Both sides then have an input stream (what the other end is saying)
 *    and an output stream (what we want to say).
 *
 *  We'll run BOTH halves in this same JVM, on localhost. The server runs
 *  in a background thread; the client (the main thread) connects, sends
 *  a few messages, reads the echoed responses, then we shut everything down.
 *
 *  This is the foundation underneath HTTP, databases, websockets, gRPC,
 *  every chat app — all of it ends up doing roughly this somewhere.
 */
public class NetworkingDemo {

    public static void run() throws Exception {
        Section.header("24) NETWORKING — TCP SOCKETS",
                "Server + client in one JVM. The basis of every network protocol.");

        // Step 1: start a tiny echo server on a random free port.
        ServerSocket server = new ServerSocket(0, 50, InetAddress.getLoopbackAddress());
        int port = server.getLocalPort();
        System.out.println("    [server] listening on 127.0.0.1:" + port);

        Thread serverThread = new Thread(() -> runServer(server), "echo-server");
        serverThread.start();

        // Give the server a beat to be ready (it's already listening, but pretty prints settle).
        Thread.sleep(50);

        // Step 2: connect as a client and chat.
        System.out.println("    [client] connecting to 127.0.0.1:" + port);
        try (Socket socket = new Socket(InetAddress.getLoopbackAddress(), port);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

            String[] messages = {"hello", "how are you?", "goodbye"};
            for (String msg : messages) {
                System.out.println("    [client] -> " + msg);
                out.println(msg);                  // send a line
                String reply = in.readLine();      // wait for the echo
                System.out.println("    [client] <- " + reply);
                if ("goodbye".equals(msg)) break;
            }
        }

        // Step 3: tidy up the server thread.
        server.close();
        serverThread.join(500);

        Section.takeaway(
                "ServerSocket   — server side, accept() blocks until a client connects.",
                "Socket         — client side OR the accepted client on the server.",
                "Streams        — InputStream (bytes in), OutputStream (bytes out).",
                "Everything higher-level (HTTP, DB drivers, message queues) is built on this.");
    }

    /** Runs in its own thread: accept one client, echo back each line until 'goodbye'. */
    private static void runServer(ServerSocket server) {
        try (Socket client = server.accept()) {    // blocks here until someone connects
            System.out.println("    [server] accepted connection from " + client.getRemoteSocketAddress());
            try (BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
                 PrintWriter out = new PrintWriter(client.getOutputStream(), true)) {

                String line;
                while ((line = in.readLine()) != null) {
                    System.out.println("    [server] got: " + line);
                    out.println("echo: " + line);     // ECHO it back, with a prefix
                    if ("goodbye".equals(line)) {
                        System.out.println("    [server] client said goodbye — closing.");
                        break;
                    }
                }
            }
        } catch (Exception ex) {
            // Server was closed externally — expected on shutdown.
            if (!server.isClosed()) {
                System.out.println("    [server] error: " + ex.getMessage());
            }
        }
    }
}
