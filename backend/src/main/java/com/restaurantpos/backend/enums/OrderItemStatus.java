package com.restaurantpos.backend.enums;

public enum OrderItemStatus {
    NEW,         // just added, not yet picked up by kitchen
    PREPARING,   // chef is cooking
    READY,       // chef marked ready
    SERVED,      // waiter delivered to table
    CANCELLED    // item removed from order
}