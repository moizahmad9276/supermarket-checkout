package com.haiilo.checkout.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "special_offers")
public class SpecialOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    private Item item;

    @Column(name = "quantity_required", nullable = false)
    private Integer quantityRequired;

    @Column(name = "offer_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal offerPrice;

    @Column(name = "valid_until")
    private Instant validUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public SpecialOffer() {}

    public static SpecialOfferBuilder builder() { return new SpecialOfferBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public Integer getQuantityRequired() { return quantityRequired; }
    public void setQuantityRequired(Integer quantityRequired) { this.quantityRequired = quantityRequired; }
    public BigDecimal getOfferPrice() { return offerPrice; }
    public void setOfferPrice(BigDecimal offerPrice) { this.offerPrice = offerPrice; }
    public Instant getValidUntil() { return validUntil; }
    public void setValidUntil(Instant validUntil) { this.validUntil = validUntil; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @PrePersist
    protected void onCreate() { this.createdAt = Instant.now(); this.updatedAt = Instant.now(); }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public static class SpecialOfferBuilder {
        private Long id;
        private Item item;
        private Integer quantityRequired;
        private BigDecimal offerPrice;
        private Instant validUntil;  

        public SpecialOfferBuilder id(Long id) { this.id = id; return this; }
        public SpecialOfferBuilder item(Item item) { this.item = item; return this; }
        public SpecialOfferBuilder quantityRequired(Integer quantityRequired) { this.quantityRequired = quantityRequired; return this; }
        public SpecialOfferBuilder offerPrice(BigDecimal offerPrice) { this.offerPrice = offerPrice; return this; }
        public SpecialOfferBuilder validUntil(Instant validUntil) { this.validUntil = validUntil; return this; }  // ← MISSING

        public SpecialOffer build() {
            SpecialOffer offer = new SpecialOffer();
            offer.id = this.id;
            offer.item = this.item;
            offer.quantityRequired = this.quantityRequired;
            offer.offerPrice = this.offerPrice;
            offer.validUntil = this.validUntil;
            return offer;
        }
    }
}