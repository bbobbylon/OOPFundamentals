package com.bob.oopfundamentals.demos;

/*
 * REST API DESIGN — the conventions every web service follows.
 *
 *  REST = Representational State Transfer. In practice it means:
 *    - URLs name RESOURCES (nouns), not actions:
 *         GOOD:  /users/42
 *         BAD:   /getUser?id=42
 *    - HTTP VERBS describe what you're doing to that resource:
 *         GET    /users/42      — read it
 *         POST   /users         — create a new one
 *         PUT    /users/42      — replace it entirely
 *         PATCH  /users/42      — partial update
 *         DELETE /users/42      — remove it
 *    - STATUS CODES tell the client what happened.
 *    - JSON is the typical request/response body.
 *
 *  We won't spin up an actual HTTP server here — instead we simulate
 *  a controller and print what request/response would look like at
 *  each step, so you can read the API in one place.
 */
public class RestApiDemo {

    public static void run() {
        Section.header("26) REST API DESIGN",
                "Resources, HTTP verbs, status codes, and idempotency.");

        Section.subheader("HTTP verbs — what each one means");
        log("GET",    "/users",        "list all users",                   200, """
                [
                  {"id": 1, "name": "Bobby"},
                  {"id": 2, "name": "Alice"}
                ]""");

        log("GET",    "/users/1",      "fetch one user by id",             200, """
                {"id": 1, "name": "Bobby", "email": "bobby@example.com"}""");

        log("GET",    "/users/999",    "user doesn't exist",               404, """
                {"error": "user not found"}""");

        log("POST",   "/users",        "create a new user (server picks id)", 201, """
                request body: {"name": "Eve", "email": "eve@example.com"}
                response:     {"id": 42, "name": "Eve", "email": "eve@example.com"}
                response header: Location: /users/42""");

        log("PUT",    "/users/1",      "replace user 1 ENTIRELY",          200, """
                request body: {"name": "Bobby", "email": "new@example.com", "age": 30}""");

        log("PATCH",  "/users/1",      "modify ONLY the fields provided",  200, """
                request body: {"email": "newer@example.com"}""");

        log("DELETE", "/users/1",      "remove user 1",                    204, "(no body)");

        log("POST",   "/users",        "duplicate email — business rule violated", 409, """
                {"error": "email already in use"}""");

        log("GET",    "/admin/secret", "unauthenticated request",          401, """
                {"error": "authentication required"}""");

        Section.subheader("STATUS CODE families");
        System.out.println("    2xx — success    (200 OK, 201 Created, 204 No Content)");
        System.out.println("    3xx — redirect   (301 Moved, 304 Not Modified)");
        System.out.println("    4xx — CLIENT error (400 Bad Request, 401 Unauthorized,");
        System.out.println("                       403 Forbidden, 404 Not Found, 409 Conflict)");
        System.out.println("    5xx — SERVER error (500 Internal Server Error, 503 Unavailable)");

        Section.subheader("IDEMPOTENCY — calling it many times = calling it once");
        System.out.println("    GET    — idempotent (just reads, no change)");
        System.out.println("    PUT    — idempotent (replacing with same body twice = same result)");
        System.out.println("    DELETE — idempotent (deleting an already-deleted thing is still 'gone')");
        System.out.println("    POST   — NOT idempotent (each call usually creates a new resource)");

        Section.takeaway(
                "URLs = nouns (resources). HTTP verbs = actions on them.",
                "Return the right status code: 2xx success, 4xx client error, 5xx server error.",
                "Use idempotent methods where you can — they're safe to retry on flaky networks.",
                "Validate inputs, paginate large lists, never trust client-supplied IDs blindly.",
                "Real-world Spring: @RestController + @GetMapping/@PostMapping/etc. — same ideas.");
    }

    private static void log(String method, String path, String description, int status, String body) {
        System.out.println();
        System.out.println("    " + pad(method, 7) + path + "   — " + description);
        System.out.println("      response status: " + status + " " + statusName(status));
        for (String line : body.split("\n")) {
            System.out.println("      " + line);
        }
    }

    private static String pad(String s, int n) {
        StringBuilder sb = new StringBuilder(s);
        while (sb.length() < n) sb.append(' ');
        return sb.toString();
    }

    private static String statusName(int code) {
        return switch (code) {
            case 200 -> "OK";
            case 201 -> "Created";
            case 204 -> "No Content";
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 409 -> "Conflict";
            case 500 -> "Internal Server Error";
            default  -> "";
        };
    }
}
