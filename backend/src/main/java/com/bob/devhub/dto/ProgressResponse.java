package com.bob.devhub.dto;

import com.bob.devhub.model.ProgressStatus;
import com.bob.devhub.model.TopicProgress;

import java.time.LocalDateTime;

public record ProgressResponse(
    String topicId,
    ProgressStatus status,
    LocalDateTime lastAccessedAt,
    LocalDateTime learnedAt
) {
    public static ProgressResponse from(TopicProgress tp) {
        return new ProgressResponse(tp.getTopicId(), tp.getStatus(), tp.getLastAccessedAt(), tp.getLearnedAt());
    }
}
