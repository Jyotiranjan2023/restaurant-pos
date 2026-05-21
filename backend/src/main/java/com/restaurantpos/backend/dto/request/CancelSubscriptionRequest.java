package com.restaurantpos.backend.dto.request;

public class CancelSubscriptionRequest {

    private String reason;   // optional

    public CancelSubscriptionRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}