package com.bob.devhub.controller;

import com.bob.devhub.dto.ProgressResponse;
import com.bob.devhub.dto.ProgressUpdateRequest;
import com.bob.devhub.dto.StatsResponse;
import com.bob.devhub.model.User;
import com.bob.devhub.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Server-side copy of a learner's per-lesson progress — the same data
 * {@code app.html} keeps in {@code localStorage} ({@code dlh_progress_v1}) when no
 * backend is configured. When {@code DEVHUB_API_BASE} is set and the user is signed
 * in, {@code app.html} mirrors every "mark learned" / "visited" event here so
 * progress follows the account across devices.
 *
 * <pre>
 *   GET    /api/progress            — every row for the caller
 *   GET    /api/progress/stats      — learned / visited / not-started counts
 *   PUT    /api/progress/{topicId}  — upsert one lesson's status
 *   DELETE /api/progress            — wipe the caller's rows
 * </pre>
 *
 * <p>Security: all four sit under the default chain's {@code anyRequest().authenticated()},
 * so a valid HS256 Bearer token is required. Every method scopes by the injected
 * {@link User} principal — there is no way to read or edit another user's rows.
 *
 * <p>{@code topicId} is the lesson's FILENAME (e.g. {@code encapsulation-visualizer.html}),
 * the same key {@code tracks-data.js} uses, so the front end never needs an id
 * mapping table.
 */
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    /** GET /api/progress — all progress entries for the current user */
    @GetMapping
    public ResponseEntity<List<ProgressResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.getAllProgressDetailed(user));
    }

    /** GET /api/progress/stats — learned / visited / not-started counts */
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.getStats(user));
    }

    /**
     * PUT /api/progress/{topicId} — create or update status for one topic.
     * topicId is URL-encoded, e.g. "encapsulation-visualizer.html"
     */
    @PutMapping("/{topicId}")
    public ResponseEntity<ProgressResponse> update(
            @AuthenticationPrincipal User user,
            @PathVariable String topicId,
            @Valid @RequestBody ProgressUpdateRequest req) {
        return ResponseEntity.ok(progressService.upsertProgress(user, topicId, req.status()));
    }

    /** DELETE /api/progress — wipe all progress for the current user */
    @DeleteMapping
    public ResponseEntity<Void> reset(@AuthenticationPrincipal User user) {
        progressService.resetProgress(user);
        return ResponseEntity.noContent().build();
    }
}
