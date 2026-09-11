package com.bob.devhub.model;

/**
 * The three states a learner's relationship with one lesson can be in. Persisted
 * as the STRING name on {@link TopicProgress#getStatus()} and sent verbatim in
 * {@code ProgressUpdateRequest} / {@code ProgressResponse}, so renaming a constant
 * is a wire-format and schema change, not a refactor.
 *
 * <p>Mirrors the states {@code app.html} tracks locally in {@code dlh_progress_v1};
 * the hub maps its "in progress" to {@link #VISITED} when syncing.
 */
public enum ProgressStatus {
    /** Default / reset. Rarely stored — a lesson with no row is implicitly this. */
    NOT_STARTED,
    /** The learner opened the lesson. Counted as "inProgress" in {@code StatsResponse}. */
    VISITED,
    /** The learner marked it done. Setting this stamps {@code learnedAt} once. */
    LEARNED
}
