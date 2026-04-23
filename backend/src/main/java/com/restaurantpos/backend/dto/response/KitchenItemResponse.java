package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.enums.OrderType;

import java.time.LocalDateTime;

public class KitchenItemResponse {

    private Long itemId;
    private Long orderId;
    private String orderNumber;
    private OrderType orderType;

    private Integer tableNumber;   // null for takeaway/delivery

    private String itemName;
    private Integer quantity;
    private OrderItemStatus status;
    private String notes;
    private Boolean isCustom;
    private LocalDateTime orderedAt;

    public KitchenItemResponse() {}

    // Getters & Setters
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }

    public Integer getTableNumber() { return tableNumber; }
    public void setTableNumber(Integer tableNumber) { this.tableNumber = tableNumber; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public OrderItemStatus getStatus() { return status; }
    public void setStatus(OrderItemStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public LocalDateTime getOrderedAt() { return orderedAt; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
}