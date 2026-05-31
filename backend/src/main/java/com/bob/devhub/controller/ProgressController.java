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
