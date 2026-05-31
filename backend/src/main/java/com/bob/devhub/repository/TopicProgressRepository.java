package com.bob.devhub.repository;

import com.bob.devhub.model.ProgressStatus;
import com.bob.devhub.model.TopicProgress;
import com.bob.devhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicProgressRepository extends JpaRepository<TopicProgress, Long> {
    List<TopicProgress> findAllByUser(User user);
    Optional<TopicProgress> findByUserAndTopicId(User user, String topicId);
    long countByUserAndStatus(User user, ProgressStatus status);
    void deleteAllByUser(User user);
}
