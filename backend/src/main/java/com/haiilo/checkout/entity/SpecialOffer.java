package com.haiilo.checkout.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents a "N for X price" special offer tied to a specific item.
 * Example: "2 for 45" means every 2 units of the item cost 45 instead of 2 * unitPrice.
 */
@Entity
@Table(name = "special_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    private Item item;

    /** How many units must be purchased to trigger the offer. */
    @Column(name = "quantity_required", nullable = false)
    private Integer quantityRequired;

    /** The total price for `quantityRequired` units under this offer. */
    @Column(name = "offer_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal offerPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
