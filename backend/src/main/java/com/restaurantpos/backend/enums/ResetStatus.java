package com.restaurantpos.backend.enums;

public enum ResetStatus {
    PENDING,      // user requested, waiting for admin approval
    APPROVED,     // admin approved, code generated, user can now reset
    USED,         // user successfully reset password
    DENIED,       // admin denied request
    EXPIRED       // 30 minutes elapsed, no longer valid
}