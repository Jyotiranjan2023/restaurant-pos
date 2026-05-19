package com.restaurantpos.backend.superadmin.dto;

public class ReactivateTenantRequest {

    private String reason;
    private Integer extendDays;  // Optional: how many days the new subscription lasts (default 30)

    public ReactivateTenantRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Integer getExtendDays() { return extendDays; }
    public void setExtendDays(Integer extendDays) { this.extendDays = extendDays; }
}