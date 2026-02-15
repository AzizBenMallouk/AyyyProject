package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "classrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "profile_image")
    private String profileImage;

    @ManyToOne
    @JoinColumn(name = "grade_id")
    private Grade grade;

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;

    @ManyToOne
    @JoinColumn(name = "campus_id")
    private Campus campus;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @ManyToOne
    @JoinColumn(name = "cme_id")
    private User cme;

    @OneToOne
    @JoinColumn(name = "delegate_id")
    private User delegate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private Boolean active;

    private Boolean bootcamp;

    private String speciality;

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Enroll> enrolls = new HashSet<>();

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<ClassroomActivity> activities = new HashSet<>();
}
