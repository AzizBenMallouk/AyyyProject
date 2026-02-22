package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "absence_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceType extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;
}
