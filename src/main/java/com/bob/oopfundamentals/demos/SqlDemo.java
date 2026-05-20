package com.bob.oopfundamentals.demos;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

/*
 * SQL & JDBC — talking to a relational database from Java.
 *
 *  JDBC is the standard Java DB API. The pattern is always the same:
 *
 *    1) DriverManager.getConnection(url, user, pass)
 *    2) Build a Statement (raw SQL) or PreparedStatement (safe, parameterized)
 *    3) executeUpdate() for INSERT/UPDATE/DELETE/DDL
 *       executeQuery()  for SELECT  (returns a ResultSet to walk through)
 *    4) Close everything (try-with-resources handles this for you)
 *
 *  We use H2 — an in-memory database that needs ZERO setup. The DB lives
 *  in JVM memory; when this method returns, it vanishes.
 *
 *  SQL essentials covered: CREATE TABLE, INSERT, SELECT (+ WHERE), UPDATE,
 *  DELETE, prepared statements, why they prevent SQL injection.
 */
public class SqlDemo {

    public static void run() throws Exception {
        Section.header("25) SQL & JDBC",
                "Relational databases: CREATE, INSERT, SELECT, UPDATE, DELETE.");

        // jdbc:h2:mem:demo = an in-memory H2 DB named "demo".
        // DB_CLOSE_DELAY=-1 keeps it alive for the duration of the JVM.
        String url = "jdbc:h2:mem:demo;DB_CLOSE_DELAY=-1";

        try (Connection conn = DriverManager.getConnection(url, "sa", "")) {

            Section.subheader("CREATE TABLE — define the schema (DDL)");
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("""
                        CREATE TABLE users (
                            id      INT PRIMARY KEY AUTO_INCREMENT,
                            name    VARCHAR(100) NOT NULL,
                            email   VARCHAR(100) UNIQUE,
                            age     INT
                        )
                        """);
                System.out.println("    table 'users' created.");
            }

            Section.subheader("INSERT — using a PreparedStatement (safe from SQL injection)");
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO users (name, email, age) VALUES (?, ?, ?)")) {
                insert(ps, "Bobby",    "bobby@example.com",    30);
                insert(ps, "Alice",    "alice@example.com",    25);
                insert(ps, "Charlie",  "charlie@example.com",  42);
                insert(ps, "Dave",     "dave@example.com",     28);
            }

            Section.subheader("SELECT — read rows back out");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, name, email, age FROM users")) {
                while (rs.next()) {
                    System.out.printf("    row: id=%d  name=%-8s  email=%-22s  age=%d%n",
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("email"),
                            rs.getInt("age"));
                }
            }

            Section.subheader("SELECT ... WHERE — parameterized query");
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT name, age FROM users WHERE age > ? ORDER BY age")) {
                ps.setInt(1, 27);
                try (ResultSet rs = ps.executeQuery()) {
                    System.out.println("    users older than 27:");
                    while (rs.next()) {
                        System.out.println("      - " + rs.getString("name") + " (" + rs.getInt("age") + ")");
                    }
                }
            }

            Section.subheader("UPDATE — modify existing rows");
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE users SET age = ? WHERE name = ?")) {
                ps.setInt(1, 31);
                ps.setString(2, "Bobby");
                int rowsAffected = ps.executeUpdate();
                System.out.println("    Bobby's age updated; rows affected = " + rowsAffected);
            }

            Section.subheader("DELETE — remove a row");
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM users WHERE name = ?")) {
                ps.setString(1, "Charlie");
                int rowsAffected = ps.executeUpdate();
                System.out.println("    Charlie deleted; rows affected = " + rowsAffected);
            }

            Section.subheader("Final table contents");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM users ORDER BY id")) {
                while (rs.next()) {
                    System.out.printf("    row: id=%d  name=%-8s  age=%d%n",
                            rs.getInt("id"), rs.getString("name"), rs.getInt("age"));
                }
            }

            Section.subheader("Why PreparedStatement? Imagine string-concatenated SQL:");
            System.out.println("    BAD:  \"DELETE FROM users WHERE name = '\" + input + \"'\"");
            System.out.println("    If input is \"x' OR '1'='1\" -> WHERE name = 'x' OR '1'='1' deletes EVERYTHING.");
            System.out.println("    PreparedStatement parameters are sent SEPARATELY from the SQL — never as text.");
        }

        Section.takeaway(
                "JDBC pattern: Connection -> Statement/PreparedStatement -> execute -> ResultSet.",
                "Always use PreparedStatement with `?` parameters — never concatenate user input.",
                "DDL (CREATE/ALTER/DROP), DML (INSERT/UPDATE/DELETE), Query (SELECT).",
                "In real apps you'll use JPA/Hibernate or Spring JDBC — but they all sit on top of this.");
    }

    private static void insert(PreparedStatement ps, String name, String email, int age) throws Exception {
        ps.setString(1, name);
        ps.setString(2, email);
        ps.setInt(3, age);
        ps.executeUpdate();
        System.out.println("    inserted: " + name + ", " + email + ", " + age);
    }
}
