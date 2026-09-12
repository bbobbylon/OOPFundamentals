package com.bob.devhub.dto;

/**
 * Response for {@code GET /api/progress/stats}, computed by
 * {@link com.bob.devhub.service.ProgressService#getStats}. {@code app.html} shows it
 * in the account panel as the server-side ("DB-counted") view of progress next to
 * the local one.
 *
 * <p>{@code totalTopics} comes from {@code app.progress.total-topics}, which mirrors the
 * lesson count in {@code tracks-data.js} — the backend cannot read that file, so
 * {@code tmp_vcheck.mjs} fails the build when the two drift. Both counts are of the same
 * registry, so this percentage should agree with the hub's own.
 *
 * @param totalTopics     denominator used for the percentage
 * @param learned         rows with status LEARNED
 * @param inProgress      rows with status VISITED
 * @param notStarted      {@code totalTopics - learned - inProgress}, floored at 0
 * @param percentComplete {@code learned / totalTopics} as an int, capped at 100
 */
public record StatsResponse(
    int totalTopics,
    long learned,
    long inProgress,
    long notStarted,
    int percentComplete
) {}
