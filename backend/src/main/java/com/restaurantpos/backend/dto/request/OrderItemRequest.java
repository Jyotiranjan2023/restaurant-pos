package com.restaurantpos.backend.dto.request;

import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class OrderItemRequest {

    // For menu items, provide productId. For custom (open) items, leave null and fill itemName/itemPrice.
    private Long productId;

    // Required only for custom items
    private String itemName;
    private BigDecimal itemPrice;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @DecimalMin(value = "0.0", message = "GST must be 0 or greater")
    private BigDecimal gstPercent;

    private Boolean isCustom = false;

    private String notes;
    
    private Long variantId;            // optional
    private List<Long> addonIds;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public BigDecimal getItemPrice() { return itemPrice; }
    public void setItemPrice(BigDecimal itemPrice) { this.itemPrice = itemPrice; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getGstPercent() { return gstPercent; }
    public void setGstPercent(BigDecimal gstPercent) { this.gstPercent = gstPercent; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public List<Long> getAddonIds() { return addonIds; }
    public void setAddonIds(List<Long> addonIds) { this.addonIds = addonIds; }
}