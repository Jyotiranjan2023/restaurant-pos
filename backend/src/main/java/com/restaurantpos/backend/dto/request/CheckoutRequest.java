package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank(message = "Plan code is required")
    private String planCode;   // BASIC / PRO / ENTERPRISE

    public CheckoutRequest() {}

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }
}