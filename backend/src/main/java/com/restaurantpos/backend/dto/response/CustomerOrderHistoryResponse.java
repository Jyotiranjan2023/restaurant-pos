package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.OrderStatus;
import com.restaurantpos.backend.enums.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerOrderHistoryResponse {

    private Long orderId;
    private String orderNumber;
    private OrderType orderType;
    private OrderStatus status;
    private Integer itemCount;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;

    public CustomerOrderHistoryResponse() {}

    public CustomerOrderHistoryResponse(Long orderId, String orderNumber, OrderType orderType,
                                        OrderStatus status, Integer itemCount,
                                        BigDecimal totalAmount, LocalDateTime orderDate) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.orderType = orderType;
        this.status = status;
        this.itemCount = itemCount;
        this.totalAmount = totalAmount;
        this.orderDate = orderDate;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public Integer getItemCount() { return itemCount; }
    public void setItemCount(Integer itemCount) { this.itemCount = itemCount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
}