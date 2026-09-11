package com.bob.devhub.dto;

/**
 * Response for {@code GET /api/progress/stats}, computed by
 * {@link com.bob.devhub.service.ProgressService#getStats}. {@code app.html} shows it
 * in the account panel as the server-side ("DB-counted") view of progress next to
 * the local one.
 *
 * <p>{@code totalTopics} is the service's hard-coded {@code TOTAL_TOPICS} constant, not
 * a count of {@code tracks-data.js} — see the note on that constant; the two have
 * already drifted (200 vs. 500+ registered pages), which is why {@code percentComplete}
 * here will not match the hub's own percentage.
 *
 * @param totalTopics     denominator used for the percentage
 * @param learned         rows with status LEARNED
 * @param inProgress      rows with status VISITED
 * @param notStarted      {@code totalTopics - learned - inProgress} (can go negative if
 *                        the constant is stale — see above)
 * @param percentComplete {@code learned / totalTopics}, rounded to an int
 */
public record StatsResponse(
    int totalTopics,
    long learned,
    long inProgress,
    long notStarted,
    int percentComplete
) {}
