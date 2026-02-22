package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "enrolls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enroll extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @ManyToOne
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Column(name = "enroll_date", nullable = false)
    private LocalDate enrollDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private Boolean active;

    @ManyToOne
    @JoinColumn(name = "squad_id")
    private Squad squad;
}
