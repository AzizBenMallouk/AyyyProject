package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "squads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Squad extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @ManyToMany
    @JoinTable(name = "squad_members", joinColumns = @JoinColumn(name = "squad_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private java.util.Set<User> members = new java.util.HashSet<>();

    @ManyToOne
    @JoinColumn(name = "scrum_master_id")
    private User scrumMaster;
}
