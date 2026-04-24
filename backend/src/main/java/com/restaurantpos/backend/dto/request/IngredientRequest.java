package com.restaurantpos.backend.dto.request;

import com.restaurantpos.backend.enums.StockUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class IngredientRequest {

    @NotBlank(message = "Ingredient name is required")
    private String name;

    private String description;

    @NotNull(message = "Unit is required")
    private StockUnit unit;

    @DecimalMin(value = "0.0", message = "Initial stock cannot be negative")
    private BigDecimal initialStock = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Low stock threshold cannot be negative")
    private BigDecimal lowStockThreshold = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Cost cannot be negative")
    private BigDecimal costPerUnit = BigDecimal.ZERO;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StockUnit getUnit() { return unit; }
    public void setUnit(StockUnit unit) { this.unit = unit; }

    public BigDecimal getInitialStock() { return initialStock; }
    public void setInitialStock(BigDecimal initialStock) { this.initialStock = initialStock; }

    public BigDecimal getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(BigDecimal lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public BigDecimal getCostPerUnit() { return costPerUnit; }
    public void setCostPerUnit(BigDecimal costPerUnit) { this.costPerUnit = costPerUnit; }
}