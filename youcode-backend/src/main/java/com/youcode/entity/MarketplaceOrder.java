package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceOrder extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private MarketplaceProduct product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "total_price", nullable = false)
    private Integer totalPrice; // in points

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    private String status; // PENDING, PROCESSING, COMPLETED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String notes;
}
