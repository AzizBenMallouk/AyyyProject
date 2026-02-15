package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_activity_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomActivityAssignment extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "classroom_activity_id", nullable = false)
    private ClassroomActivity classroomActivity;

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @Column(columnDefinition = "TEXT")
    private String submission;

    @Column(name = "submission_url")
    private String submissionUrl;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    private Double grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private String status; // PENDING, SUBMITTED, GRADED
}
