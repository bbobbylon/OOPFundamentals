package com.bob.devhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * One row per (user, lesson): the server-side twin of the entry {@code app.html}
 * keeps in {@code localStorage} under {@code dlh_progress_v1}.
 *
 * <p>Owned by {@link com.bob.devhub.service.ProgressService}, read/written through
 * {@link com.bob.devhub.repository.TopicProgressRepository}, and only ever exposed
 * to clients via {@link com.bob.devhub.dto.ProgressResponse}.
 *
 * <p>Schema notes: the {@code (user_id, topic_id)} unique constraint is what makes
 * {@code upsertProgress} safe — a second PUT for the same lesson updates rather
 * than duplicates. {@code user} is LAZY and is never dereferenced during DTO
 * mapping, which is what allows {@code spring.jpa.open-in-view=false} in
 * {@code application.yml}. {@code topic_id} is the lesson FILENAME (length 120 —
 * the longest registered page name is well under that).
 */
@Entity
@Table(name = "topic_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "topic_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "topic_id", nullable = false, length = 120)
    private String topicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProgressStatus status;

    private LocalDateTime lastAccessedAt;
    private LocalDateTime learnedAt;

    /**
     * Stamps {@code lastAccessedAt} on first insert so a row built via the builder
     * (which leaves it null) is never persisted without a timestamp. Updates are
     * stamped explicitly by {@code ProgressService.upsertProgress}.
     */
    @PrePersist
    protected void onCreate() {
        lastAccessedAt = LocalDateTime.now();
    }
}
