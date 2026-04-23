package com.restaurantpos.backend.dto.request;

import com.restaurantpos.backend.enums.TableStatus;
import jakarta.validation.constraints.NotNull;

public class TableStatusRequest {

    @NotNull(message = "Status is required")
    private TableStatus status;

    public TableStatus getStatus() { return status; }
    public void setStatus(TableStatus status) { this.status = status; }
}