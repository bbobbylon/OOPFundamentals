package com.bob.devhub.dto;

import com.bob.devhub.model.ProgressStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for {@code PUT /api/progress/{topicId}}. The topic itself travels in
 * the URL; the body carries only the new status. {@code app.html} sends this on
 * every "mark learned" / lesson-open event when a backend is configured.
 *
 * <p>Deserialisation is by enum NAME, so the SPA must send {@code "LEARNED"},
 * {@code "VISITED"} or {@code "NOT_STARTED"} verbatim — {@code @NotNull} catches a
 * missing field but an unknown string is a 400 from Jackson, not from validation.
 *
 * @param status the status to store; LEARNED sets {@code learnedAt}, anything else clears it
 */
public record ProgressUpdateRequest(
    @NotNull ProgressStatus status
) {}
