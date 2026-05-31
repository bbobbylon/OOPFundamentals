package com.bob.devhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @PrePersist
    protected void onCreate() {
        lastAccessedAt = LocalDateTime.now();
    }
}
