package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "point_criterias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointCriteria extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "default_value")
    private Integer defaultValue;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private PointCriteriaCategory category;

    private Boolean active;
}
