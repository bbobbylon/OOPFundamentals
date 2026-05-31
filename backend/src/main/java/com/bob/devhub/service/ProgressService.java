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
public class ProgressService {

    // Total topics across all tracks — keep in sync with app.html
    private static final int TOTAL_TOPICS = 200;

    private final TopicProgressRepository progressRepo;

    public Map<String, ProgressStatus> getAllProgress(User user) {
        return progressRepo.findAllByUser(user).stream()
                .collect(Collectors.toMap(TopicProgress::getTopicId, TopicProgress::getStatus));
    }

    public List<ProgressResponse> getAllProgressDetailed(User user) {
        return progressRepo.findAllByUser(user).stream()
                .map(ProgressResponse::from)
                .toList();
    }

    @Transactional
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
    public void resetProgress(User user) {
        progressRepo.deleteAllByUser(user);
    }

    public StatsResponse getStats(User user) {
        long learned    = progressRepo.countByUserAndStatus(user, ProgressStatus.LEARNED);
        long inProgress = progressRepo.countByUserAndStatus(user, ProgressStatus.VISITED);
        long notStarted = TOTAL_TOPICS - learned - inProgress;
        int pct = (int) Math.round((double) learned / TOTAL_TOPICS * 100);
        return new StatsResponse(TOTAL_TOPICS, learned, inProgress, notStarted, pct);
    }
}
