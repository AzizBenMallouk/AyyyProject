package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "classroom_activity_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomActivityType extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    private String icon;

    private String color;
}
