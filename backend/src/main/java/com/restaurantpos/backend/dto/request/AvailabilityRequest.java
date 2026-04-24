package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.NotNull;

public class AvailabilityRequest {

    @NotNull(message = "Available flag is required")
    private Boolean available;

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}