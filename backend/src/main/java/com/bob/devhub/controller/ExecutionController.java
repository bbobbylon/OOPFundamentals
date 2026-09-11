package com.bob.devhub.controller;

import com.bob.devhub.dto.ExecRequest;
import com.bob.devhub.dto.ExecResult;
import com.bob.devhub.service.exec.ExecutionService;
import com.bob.devhub.service.exec.Language;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Runs user snippets server-side.
 *
 *   GET  /api/run/languages   — public: which runtimes are available (UI gating)
 *   POST /api/run/{language}  — authenticated: execute code, return real output
 *
 * The POST is auth-gated on purpose: an open code-runner is remote code
 * execution. It sits under the default security chain's anyRequest().authenticated().
 *
 * <p>Who calls it: ONLY {@code frontend/devhub-run.js}, loaded by the Python,
 * TypeScript and Shell playground pages for their "Run on server (real)" mode.
 * That client calls {@code languages} first to decide whether to show the toggle,
 * then reuses the hub's saved {@code dlh_token}; if there is none (or it gets a 401)
 * it silently logs in as the dev-seeded {@code demo} account so the playground stays
 * one-click. The seeded account is therefore load-bearing for this feature — see
 * {@link com.bob.devhub.config.DataInitializer}.
 *
 * <p>Everything about HOW code runs (timeouts, output caps, env sanitising,
 * concurrency) lives in {@link ExecutionService}; this class only translates its
 * exceptions into HTTP statuses. In the {@code prod} profile execution is disabled
 * by default ({@code EXEC_ENABLED=false}), which makes every POST here a 503.
 */
@RestController
@RequestMapping("/api/run")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService exec;

    /**
     * Public capability probe: which runtimes are installed on this host and the
     * limits they run under. Public because the UI needs it BEFORE the user has a
     * token, and it leaks nothing but booleans and numbers.
     */
    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> languages() {
        return ResponseEntity.ok(exec.capabilities());
    }

    /**
     * Executes one snippet and returns its captured output.
     *
     * <p>Status mapping — the front end keys its error banner off the {@code error}
     * field, so keep these stable:
     * <ul>
     *   <li>400 {@code unsupported_language} — path segment is not one of
     *       {@link Language}'s ids/aliases</li>
     *   <li>503 {@code execution_disabled} — {@code app.exec.enabled=false} (prod default)</li>
     *   <li>400 {@code bad_request} — empty or oversized code ({@link IllegalArgumentException})</li>
     *   <li>503 {@code unavailable} — runner busy / temp dir failure ({@link IllegalStateException})</li>
     *   <li>200 {@link ExecResult} — including runs that timed out or were truncated;
     *       those are reported in the body, not as HTTP errors</li>
     * </ul>
     */
    @PostMapping("/{language}")
    public ResponseEntity<?> run(@PathVariable String language, @RequestBody ExecRequest req) {
        Language lang = Language.from(language);
        if (lang == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "unsupported_language", "language", language));
        }
        if (!exec.isEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "execution_disabled",
                            "message", "Server-side code execution is disabled in this environment."));
        }
        try {
            ExecResult result = exec.run(lang, req.code(), req.stdin());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "bad_request", "message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "unavailable", "message", e.getMessage()));
        }
    }
}
