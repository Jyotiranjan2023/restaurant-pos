package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.Pattern;

public class OrderSettingsRequest {

    private Boolean autoConfirmOrders;
    private Boolean allowCustomItems;

    @Pattern(regexp = "DINE_IN|TAKEAWAY|DELIVERY", message = "Invalid order type")
    private String defaultOrderType;

    public Boolean getAutoConfirmOrders() { return autoConfirmOrders; }
    public void setAutoConfirmOrders(Boolean autoConfirmOrders) { this.autoConfirmOrders = autoConfirmOrders; }

    public Boolean getAllowCustomItems() { return allowCustomItems; }
    public void setAllowCustomItems(Boolean allowCustomItems) { this.allowCustomItems = allowCustomItems; }

    public String getDefaultOrderType() { return defaultOrderType; }
    public void setDefaultOrderType(String defaultOrderType) { this.defaultOrderType = defaultOrderType; }
}