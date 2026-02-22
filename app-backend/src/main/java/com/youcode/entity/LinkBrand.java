package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "link_brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkBrand extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "link_brand_type_id")
    private LinkBrandType linkBrandType;

    @Column(nullable = false)
    private String url;
}
