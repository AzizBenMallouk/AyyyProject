package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomActivity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne
    @JoinColumn(name = "classroom_activity_type_id")
    private ClassroomActivityType activityType;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "activity_datetime")
    private LocalDateTime activityDatetime;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "max_points")
    private Integer maxPoints;

    private Boolean active;

    @Column(name = "assignment_type")
    private String assignmentType; // INDIVIDUAL, PAIR, GROUP, SQUAD, CLASSROOM

    private Integer duration; // in minutes

    @Column(name = "is_recurring")
    private Boolean isRecurring;

    @Column(name = "recurrence_pattern")
    private String recurrencePattern;

    @Column(columnDefinition = "TEXT")
    private String resources; // JSON string or text links

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "parent_activity_id")
    private ClassroomActivity parentActivity;
}
