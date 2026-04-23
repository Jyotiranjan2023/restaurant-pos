package com.restaurantpos.backend.dto.request;

import com.restaurantpos.backend.enums.OrderItemStatus;
import jakarta.validation.constraints.NotNull;

public class KitchenStatusRequest {

    @NotNull(message = "Status is required")
    private OrderItemStatus status;

    public OrderItemStatus getStatus() { return status; }
    public void setStatus(OrderItemStatus status) { this.status = status; }
}