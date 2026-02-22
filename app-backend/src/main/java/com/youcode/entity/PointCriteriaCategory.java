package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "point_criteria_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointCriteriaCategory extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    private String color;
}
