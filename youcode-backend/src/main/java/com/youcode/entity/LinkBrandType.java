package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "link_brand_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkBrandType extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String icon;
}
