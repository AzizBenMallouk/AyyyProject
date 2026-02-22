package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Point extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @ManyToOne
    @JoinColumn(name = "point_criteria_id", nullable = false)
    private PointCriteria pointCriteria;

    @ManyToOne
    @JoinColumn(name = "classroom_activity_assignment_id")
    private ClassroomActivityAssignment classroomActivityAssignment;

    @Column(nullable = false)
    private Integer value;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "awarded_at")
    private LocalDateTime awardedAt;

    @ManyToOne
    @JoinColumn(name = "awarded_by")
    private User awardedBy;
}
