package com.bob.devhub.dto;

import com.bob.devhub.model.ProgressStatus;
import com.bob.devhub.model.TopicProgress;

import java.time.LocalDateTime;

/**
 * One lesson's progress as returned by {@code GET /api/progress} (as a list) and
 * {@code PUT /api/progress/{topicId}} (single). {@code app.html} merges these into
 * its local {@code dlh_progress_v1} map on sign-in.
 *
 * <p>Exists so the {@link TopicProgress} ENTITY is never serialised directly — that
 * would drag the lazy {@code user} association (and the user's password hash) into
 * the JSON, and would break under {@code open-in-view: false}.
 *
 * @param topicId        the lesson filename, e.g. {@code encapsulation-visualizer.html}
 * @param status         {@link ProgressStatus} — the SPA maps VISITED → "in progress"
 * @param lastAccessedAt when the row was last upserted
 * @param learnedAt      first time the status became LEARNED; null until then, and
 *                       cleared again if the learner un-marks it
 */
public record ProgressResponse(
    String topicId,
    ProgressStatus status,
    LocalDateTime lastAccessedAt,
    LocalDateTime learnedAt
) {
    /** Entity → DTO projection used by {@link com.bob.devhub.service.ProgressService}. */
    public static ProgressResponse from(TopicProgress tp) {
        return new ProgressResponse(tp.getTopicId(), tp.getStatus(), tp.getLastAccessedAt(), tp.getLearnedAt());
    }
}
