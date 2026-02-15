package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marketplace_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceCategory extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    private String icon;
}
