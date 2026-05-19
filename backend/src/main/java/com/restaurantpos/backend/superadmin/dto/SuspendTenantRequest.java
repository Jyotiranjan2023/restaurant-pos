package com.restaurantpos.backend.superadmin.dto;

public class SuspendTenantRequest {

    private String reason;  // Optional — free-text reason for the suspension

    public SuspendTenantRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}