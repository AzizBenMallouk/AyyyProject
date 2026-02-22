package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Status extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
}
