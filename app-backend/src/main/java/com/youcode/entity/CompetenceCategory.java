package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "competence_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetenceCategory extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;
}
