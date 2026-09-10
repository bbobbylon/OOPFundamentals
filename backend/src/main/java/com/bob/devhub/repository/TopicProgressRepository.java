package com.bob.devhub.repository;

import com.bob.devhub.model.ProgressStatus;
import com.bob.devhub.model.TopicProgress;
import com.bob.devhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Data access for {@link TopicProgress}. Every method takes the owning {@link User},
 * which is how {@link com.bob.devhub.service.ProgressService} guarantees one user can
 * never read or wipe another's rows — there is deliberately no "find by topicId
 * alone" method to misuse.
 *
 * <p>All queries are Spring Data derived queries (no {@code @Query}); the method
 * names ARE the SQL, so renaming one changes the query.
 *
 * <p>Note: this backend uses JPA, unlike the author's usual JDBC
 * Query/RowMapper/Repo pattern — it predates that convention and the surface is
 * small enough not to be worth porting.
 */
public interface TopicProgressRepository extends JpaRepository<TopicProgress, Long> {
    /** Backs {@code GET /api/progress}: every row for one user, unordered. */
    List<TopicProgress> findAllByUser(User user);
    /** The upsert lookup; unique by the {@code (user_id, topic_id)} constraint. */
    Optional<TopicProgress> findByUserAndTopicId(User user, String topicId);
    /** Backs {@code /api/progress/stats}; called once per status the stats need. */
    long countByUserAndStatus(User user, ProgressStatus status);
    /** Backs {@code DELETE /api/progress}; must run inside a {@code @Transactional} caller. */
    void deleteAllByUser(User user);
}
