package com.restaurantpos.backend.enums;

public enum BillStatus {
    PENDING,      // bill generated, awaiting payment
    PARTIALLY_PAID, // some amount paid, more due
    PAID,         // fully paid
    CANCELLED     // bill cancelled (admin only)
}