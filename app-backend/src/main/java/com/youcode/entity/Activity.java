package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "activity_type_id")
    private ClassroomActivityType activityType;

    @Column(columnDefinition = "TEXT")
    private String resources;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "difficulty_level")
    private String difficultyLevel; // EASY, MEDIUM, HARD, EXPERT

    @Column(name = "assignment_type")
    private String assignmentType; // INDIVIDUAL, PAIR, GROUP, SQUAD, CLASSROOM

}
