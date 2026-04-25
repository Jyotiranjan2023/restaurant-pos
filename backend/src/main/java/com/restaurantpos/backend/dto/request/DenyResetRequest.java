package com.restaurantpos.backend.dto.request;

public class DenyResetRequest {

    private String reason;   // optional

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}