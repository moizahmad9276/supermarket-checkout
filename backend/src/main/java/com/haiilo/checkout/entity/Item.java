package com.haiilo.checkout.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToOne(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private SpecialOffer specialOffer;

    public Item() {}

    public Item(Long id, String name, BigDecimal unitPrice, Instant createdAt, Instant updatedAt, SpecialOffer specialOffer) {
        this.id = id;
        this.name = name;
        this.unitPrice = unitPrice;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.specialOffer = specialOffer;
    }

    public static ItemBuilder builder() { return new ItemBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public SpecialOffer getSpecialOffer() { return specialOffer; }
    public void setSpecialOffer(SpecialOffer specialOffer) { this.specialOffer = specialOffer; }

    @PrePersist
    protected void onCreate() { this.createdAt = Instant.now(); this.updatedAt = Instant.now(); }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public static class ItemBuilder {
        private Long id;
        private String name;
        private BigDecimal unitPrice;

        public ItemBuilder id(Long id) { this.id = id; return this; }
        public ItemBuilder name(String name) { this.name = name; return this; }
        public ItemBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public Item build() {
            Item item = new Item();
            item.id = this.id;
            item.name = this.name;
            item.unitPrice = this.unitPrice;
            return item;
        }
    }
}