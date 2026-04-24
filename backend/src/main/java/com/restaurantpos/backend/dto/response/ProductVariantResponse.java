package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;

public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String name;
    private BigDecimal price;
    private BigDecimal gstPercent;
    private Integer displayOrder;
    private Boolean active;

    public ProductVariantResponse() {}

    public ProductVariantResponse(Long id, Long productId, String name, BigDecimal price,
                                   BigDecimal gstPercent, Integer displayOrder, Boolean active) {
        this.id = id;
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.gstPercent = gstPercent;
        this.displayOrder = displayOrder;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getGstPercent() { return gstPercent; }
    public void setGstPercent(BigDecimal gstPercent) { this.gstPercent = gstPercent; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}