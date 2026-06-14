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
 */
@RestController
@RequestMapping("/api/run")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService exec;

    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> languages() {
        return ResponseEntity.ok(exec.capabilities());
    }

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
