package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "absences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Absence extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @ManyToOne
    @JoinColumn(name = "absence_type_id")
    private AbsenceType absenceType;

    @Column(name = "absence_date", nullable = false)
    private LocalDate absenceDate;

    @Column(name = "is_late")
    private Boolean isLate;

    @Column(name = "late_minutes")
    private Integer lateMinutes;

    @Column(name = "arrival_time")
    private LocalTime arrivalTime;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private Boolean justified;
}
