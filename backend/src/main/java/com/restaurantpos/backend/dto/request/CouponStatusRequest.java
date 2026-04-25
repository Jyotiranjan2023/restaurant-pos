package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.NotNull;

public class CouponStatusRequest {

    @NotNull(message = "Active flag is required")
    private Boolean active;

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}