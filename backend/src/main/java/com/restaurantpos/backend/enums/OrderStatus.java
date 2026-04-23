package com.restaurantpos.backend.enums;

public enum OrderStatus {
    RUNNING,      // order is open, items being added / prepared
    COMPLETED,    // order paid and closed
    CANCELLED     // order cancelled
}