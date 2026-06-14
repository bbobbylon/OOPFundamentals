package com.bob.devhub.service.exec;

import com.bob.devhub.dto.ExecResult;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

/**
 * Runs a snippet of Python / TypeScript / Shell in a child process, with hard
 * safety rails so untrusted code can't run away with the machine:
 *
 *   • a wall-clock timeout that force-kills the whole process tree
 *   • stdout/stderr capped at a byte limit (drained so the child can't block)
 *   • a sanitized environment — only PATH (+ minimal OS vars) is passed, so the
 *     backend's secrets (JWT_SECRET, DB creds) are NOT visible to the snippet
 *   • a per-run temp working directory, deleted afterwards
 *   • a concurrency cap so a burst of requests can't fork-bomb the host
 *
 * This "process mode" is the safe default. Stronger isolation (one locked-down
 * container per run) is possible via a DockerCodeRunner, but we deliberately do
 * NOT grant this web-facing service access to the Docker socket. Execution is
 * DISABLED entirely in the prod profile (see application-prod.yml).
 */
@Service
public class ExecutionService {

    private static final Logger log = LoggerFactory.getLogger(ExecutionService.class);
    private static final boolean WIN = System.getProperty("os.name", "").toLowerCase().contains("win");

    @Value("${app.exec.enabled:true}")          private boolean enabled;
    @Value("${app.exec.timeout-ms:5000}")       private long timeoutMs;
    @Value("${app.exec.max-output-bytes:64000}") private int maxOutputBytes;
    @Value("${app.exec.max-code-bytes:100000}")  private int maxCodeBytes;
    @Value("${app.exec.max-concurrent:2}")       private int maxConcurrent;

    // Optional command overrides (blank → OS-aware default below).
    @Value("${app.exec.cmd.python:}") private String pythonCmd;
    @Value("${app.exec.cmd.node:}")   private String nodeCmd;
    @Value("${app.exec.cmd.shell:}")  private String shellCmd;
    @Value("${app.exec.cmd.ts-args:--no-warnings --experimental-transform-types}") private String tsArgs;

    private Semaphore slots;
    private final ExecutorService readers = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "exec-reader"); t.setDaemon(true); return t;
    });
    private final Map<String, Boolean> availabilityCache = new ConcurrentHashMap<>();

    public boolean isEnabled() { return enabled; }

    /** Advertised to GET /api/run/languages so the UI can enable/disable toggles. */
    public Map<String, Object> capabilities() {
        List<Map<String, Object>> langs = new ArrayList<>();
        for (Language l : Language.values()) {
            langs.add(Map.of("id", l.id, "available", enabled && runtimeAvailable(l)));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("enabled", enabled);
        out.put("timeoutMs", timeoutMs);
        out.put("maxOutputBytes", maxOutputBytes);
        out.put("languages", langs);
        return out;
    }

    /** Runs the snippet and returns its captured output. */
    public ExecResult run(Language lang, String code, String stdin) {
        if (!enabled) throw new IllegalStateException("Code execution is disabled on this server.");
        if (code == null || code.isBlank()) throw new IllegalArgumentException("No code provided.");
        if (code.getBytes(StandardCharsets.UTF_8).length > maxCodeBytes)
            throw new IllegalArgumentException("Code exceeds the " + maxCodeBytes + "-byte limit.");

        Semaphore s = slots();
        boolean acquired;
        try { acquired = s.tryAcquire(2, TimeUnit.SECONDS); }
        catch (InterruptedException e) { Thread.currentThread().interrupt(); throw new IllegalStateException("Interrupted."); }
        if (!acquired) throw new IllegalStateException("The runner is busy — too many concurrent executions. Try again.");

        Path dir = null;
        try {
            dir = Files.createTempDirectory("devhub-run-");
            Path file = dir.resolve(lang.fileName);
            Files.writeString(file, code);
            return execute(lang, dir, file, stdin);
        } catch (IOException e) {
            throw new IllegalStateException("Could not prepare the run: " + e.getMessage(), e);
        } finally {
            deleteTree(dir);
            s.release();
        }
    }

    private ExecResult execute(Language lang, Path dir, Path file, String stdin) {
        List<String> cmd = commandFor(lang, file);
        ProcessBuilder pb = new ProcessBuilder(cmd).directory(dir.toFile());
        sanitizeEnv(pb, dir);

        long start = System.currentTimeMillis();
        Process p;
        try { p = pb.start(); }
        catch (IOException e) {
            // Most commonly: the interpreter isn't installed / not on PATH.
            return new ExecResult(lang.id, "",
                    "Could not start '" + cmd.get(0) + "': " + e.getMessage()
                        + "\n(Is the runtime installed and on PATH?)",
                    -1, System.currentTimeMillis() - start, false, false);
        }

        // feed stdin (best-effort), then close so the program sees EOF
        try (OutputStream os = p.getOutputStream()) {
            if (stdin != null && !stdin.isEmpty()) os.write(stdin.getBytes(StandardCharsets.UTF_8));
        } catch (IOException ignored) { }

        Future<Capture> outF = readers.submit(() -> drain(p.getInputStream()));
        Future<Capture> errF = readers.submit(() -> drain(p.getErrorStream()));

        boolean finished;
        boolean timedOut = false;
        try { finished = p.waitFor(timeoutMs, TimeUnit.MILLISECONDS); }
        catch (InterruptedException e) { Thread.currentThread().interrupt(); finished = false; }

        if (!finished) {
            timedOut = true;
            killTree(p);
        }
        long durationMs = System.currentTimeMillis() - start;
        int exit = timedOut ? -1 : safeExit(p);

        Capture out = await(outF), err = await(errF);
        boolean truncated = out.truncated || err.truncated;
        String stderr = err.text;
        if (timedOut) {
            stderr = (stderr.isEmpty() ? "" : stderr + "\n")
                    + "⏱ Killed: exceeded the " + timeoutMs + " ms time limit.";
        }
        return new ExecResult(lang.id, out.text, stderr, exit, durationMs, timedOut, truncated);
    }

    // ── command resolution (OS-aware, overridable) ──────────────────────────
    private List<String> commandFor(Language lang, Path file) {
        String f = file.toString();
        return switch (lang) {
            case PYTHON -> List.of(python(), f);
            case TYPESCRIPT -> {
                List<String> c = new ArrayList<>();
                c.add(node());
                for (String a : tsArgs.trim().split("\\s+")) if (!a.isBlank()) c.add(a);
                c.add(f);
                yield c;
            }
            case SHELL -> List.of(shell(), f);
        };
    }
    private String python() { return notBlank(pythonCmd, WIN ? "python" : "python3"); }
    private String node()   { return notBlank(nodeCmd, "node"); }
    private String shell()  { return notBlank(shellCmd, WIN ? "bash" : "sh"); }
    private static String notBlank(String v, String dflt) { return (v == null || v.isBlank()) ? dflt : v; }

    /** Pass ONLY PATH (+ a couple OS essentials) so secrets in the backend env don't leak. */
    private void sanitizeEnv(ProcessBuilder pb, Path dir) {
        Map<String, String> env = pb.environment();
        String path = env.get("PATH");
        String sysRoot = env.get("SystemRoot");      // Windows: python/node need this
        String comspec = env.get("ComSpec");
        env.clear();
        if (path != null) env.put("PATH", path);
        env.put("HOME", dir.toString());
        env.put("TMPDIR", dir.toString());
        if (WIN) {
            if (sysRoot != null) env.put("SystemRoot", sysRoot);
            if (comspec != null) env.put("ComSpec", comspec);
            env.put("TEMP", dir.toString());
            env.put("TMP", dir.toString());
        }
    }

    private boolean runtimeAvailable(Language lang) {
        return availabilityCache.computeIfAbsent(lang.id, k -> {
            // busybox `sh --version` isn't supported, so probe the shell with `-c exit 0`
            // instead; python/node both answer `--version`.
            ProcessBuilder pb = switch (lang) {
                case PYTHON -> new ProcessBuilder(python(), "--version");
                case TYPESCRIPT -> new ProcessBuilder(node(), "--version");
                case SHELL -> new ProcessBuilder(shell(), "-c", "exit 0");
            };
            try {
                Process probe = pb.redirectErrorStream(true).start();
                boolean done = probe.waitFor(3, TimeUnit.SECONDS);
                if (!done) { probe.destroyForcibly(); return false; }
                return probe.exitValue() == 0;
            } catch (Exception e) { return false; }
        });
    }

    // ── process tree teardown ───────────────────────────────────────────────
    private static void killTree(Process p) {
        p.descendants().forEach(ProcessHandle::destroyForcibly);
        p.destroyForcibly();
        try { p.waitFor(2, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
    private static int safeExit(Process p) { try { return p.exitValue(); } catch (IllegalStateException e) { return -1; } }

    // ── capped stream draining ──────────────────────────────────────────────
    private record Capture(String text, boolean truncated) {}
    private Capture drain(InputStream in) {
        var buf = new java.io.ByteArrayOutputStream();
        boolean truncated = false;
        byte[] chunk = new byte[8192];
        try {
            int n;
            while ((n = in.read(chunk)) != -1) {
                if (buf.size() < maxOutputBytes) {
                    buf.write(chunk, 0, Math.min(n, maxOutputBytes - buf.size()));
                    if (buf.size() >= maxOutputBytes) truncated = true;
                } else {
                    truncated = true; // keep reading to not block the child, but discard
                }
            }
        } catch (IOException ignored) { }
        return new Capture(buf.toString(StandardCharsets.UTF_8), truncated);
    }
    private Capture await(Future<Capture> f) {
        try { return f.get(3, TimeUnit.SECONDS); }
        catch (Exception e) { return new Capture("", false); }
    }

    private synchronized Semaphore slots() {
        if (slots == null) slots = new Semaphore(Math.max(1, maxConcurrent));
        return slots;
    }
    private static void deleteTree(Path dir) {
        if (dir == null) return;
        try (var walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(pth -> { try { Files.deleteIfExists(pth); } catch (IOException ignored) {} });
        } catch (IOException ignored) { }
    }

    @PreDestroy void shutdown() { readers.shutdownNow(); }
}
