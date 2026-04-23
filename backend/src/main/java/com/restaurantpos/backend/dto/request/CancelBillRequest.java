package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CancelBillRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String reason;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}