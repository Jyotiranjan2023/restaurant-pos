package com.restaurantpos.backend.enums;

public enum SubscriptionStatus {
    TRIAL,           // 7-day free trial active
    ACTIVE,          // Paid subscription active
    GRACE_PERIOD,    // Payment failed, in 7-day grace
    SUSPENDED,       // Grace period ended, no access
    CANCELLED,       // Manually cancelled by user
    LIFETIME_FREE    // Free forever (existing tenants, special grants)
}