package com.bob.devhub.service;

import com.bob.devhub.dto.ProgressResponse;
import com.bob.devhub.dto.StatsResponse;
import com.bob.devhub.model.ProgressStatus;
import com.bob.devhub.model.TopicProgress;
import com.bob.devhub.model.User;
import com.bob.devhub.repository.TopicProgressRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
/**
 * Owns "which lessons has this learner finished?" — the only part of DevHub that is
 * genuinely per-user server-side state.
 *
 * <p>Where it sits: {@code ProgressController} exposes these five methods over
 * /api/progress/**, and the hub (app.html) calls them to light up the track cards. The
 * site works fully WITHOUT this backend — the front end falls back to localStorage —
 * so nothing here may become required for a lesson to load. This is the sync layer
 * that makes progress follow a learner between devices, not the source of truth for
 * whether a page renders.
 *
 * <p>Everything is scoped by {@link User}: every method takes the authenticated
 * principal and every query filters on it. There is no "get progress for user X"
 * overload on purpose — an endpoint that takes a user id is one authorization bug away
 * from leaking another learner's history.
 */
public class ProgressService {

    // Total topics across all tracks — keep in sync with app.html
    private static final int TOTAL_TOPICS = 200;

    private final TopicProgressRepository progressRepo;

    /**
     * Every topic this learner has touched, as topicId → status. The compact shape the hub
     * wants: one call on load, then a map lookup per track card rather than a request per
     * lesson.
     *
     * <p>Topics the learner has never opened are ABSENT rather than NOT_STARTED — callers
     * must treat a missing key as "not started". Storing a row per untouched lesson would
     * mean 521 rows for a learner who has read one page.
     */
    public Map<String, ProgressStatus> getAllProgress(User user) {
        return progressRepo.findAllByUser(user).stream()
                .collect(Collectors.toMap(TopicProgress::getTopicId, TopicProgress::getStatus));
    }

    /**
     * The same rows as {@link #getAllProgress(User)} but with timestamps — what the stats
     * and history views need, and more than the hub should ask for on every page load.
     *
     * <p>Maps through {@code ProgressResponse.from} rather than returning entities, which
     * is what keeps the lazy {@code user} association untouched and lets
     * {@code spring.jpa.open-in-view=false} stay off. Returning the entity here would
     * serialize the whole User graph, password hash included.
     */
    public List<ProgressResponse> getAllProgressDetailed(User user) {
        return progressRepo.findAllByUser(user).stream()
                .map(ProgressResponse::from)
                .toList();
    }

    @Transactional
    /**
     * Record progress on one lesson, creating the row if this is the first visit.
     *
     * <p>Upsert rather than insert because the front end fires this on every visit and the
     * unique constraint on (user_id, topic_id) would reject the second one. It is safe to
     * call repeatedly with the same value.
     *
     * <p>{@code learnedAt} is set the FIRST time a topic reaches LEARNED and preserved on
     * later LEARNED writes, so a re-read never rewrites history — but it is CLEARED if the
     * learner drops the topic back to VISITED, so "when did I learn this" can never point
     * at a lesson the learner has since un-finished.
     */
    public ProgressResponse upsertProgress(User user, String topicId, ProgressStatus status) {
        TopicProgress tp = progressRepo.findByUserAndTopicId(user, topicId)
                .orElseGet(() -> TopicProgress.builder().user(user).topicId(topicId).build());

        tp.setStatus(status);
        tp.setLastAccessedAt(LocalDateTime.now());
        if (status == ProgressStatus.LEARNED && tp.getLearnedAt() == null) {
            tp.setLearnedAt(LocalDateTime.now());
        } else if (status != ProgressStatus.LEARNED) {
            tp.setLearnedAt(null);
        }
        return ProgressResponse.from(progressRepo.save(tp));
    }

    @Transactional
    /**
     * Delete every progress row for this learner. Irreversible, and deliberately
     * all-or-nothing: there is no per-track reset, because a half-cleared history is harder
     * to reason about than a fresh start. The caller is responsible for confirming intent.
     */
    public void resetProgress(User user) {
        progressRepo.deleteAllByUser(user);
    }

    /**
     * The dashboard summary: learned / in-progress / not-started counts and a completion
     * percentage.
     *
     * <p>KNOWN DRIFT: the percentage is computed against the hard-coded
     * {@code TOTAL_TOPICS} above, which no longer matches the site — tracks-data.js
     * registers far more pages than that today. Until the two are reconciled this figure
     * reads optimistically, and a learner can exceed 100%. Counting from the registry
     * instead of a constant is the real fix.
     */
    public StatsResponse getStats(User user) {
        long learned    = progressRepo.countByUserAndStatus(user, ProgressStatus.LEARNED);
        long inProgress = progressRepo.countByUserAndStatus(user, ProgressStatus.VISITED);
        long notStarted = TOTAL_TOPICS - learned - inProgress;
        int pct = (int) Math.round((double) learned / TOTAL_TOPICS * 100);
        return new StatsResponse(TOTAL_TOPICS, learned, inProgress, notStarted, pct);
    }
}
