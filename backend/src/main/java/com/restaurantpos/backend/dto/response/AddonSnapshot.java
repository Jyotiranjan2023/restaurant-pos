package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;

/**
 * Snapshot of an addon at the time of ordering.
 * Stored as JSON inside OrderItem.addonsJson.
 */
public class AddonSnapshot {

    private Long id;
    private String name;
    private BigDecimal price;

    public AddonSnapshot() {}

    public AddonSnapshot(Long id, String name, BigDecimal price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}