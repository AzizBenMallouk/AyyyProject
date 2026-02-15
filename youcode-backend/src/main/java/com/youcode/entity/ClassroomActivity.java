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

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "max_points")
    private Integer maxPoints;

    private Boolean active;
}
