package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "marketplace_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceProduct extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer price; // in points

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private MarketplaceCategory category;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    private Boolean active;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private Set<MarketplaceOrder> orders = new HashSet<>();
}
