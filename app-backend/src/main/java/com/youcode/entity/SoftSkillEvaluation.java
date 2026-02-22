package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "soft_skill_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoftSkillEvaluation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private StudentInterview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soft_skill_id", nullable = false)
    private SoftSkill softSkill;

    @Column(nullable = false)
    private Integer score; // e.g., 1-5 or 1-100

    @Column(columnDefinition = "TEXT")
    private String comment;
}
