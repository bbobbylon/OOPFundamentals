package com.bob.devhub.dto;

public record StatsResponse(
    int totalTopics,
    long learned,
    long inProgress,
    long notStarted,
    int percentComplete
) {}
