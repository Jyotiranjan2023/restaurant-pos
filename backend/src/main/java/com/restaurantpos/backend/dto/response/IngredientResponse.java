package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.StockUnit;
import java.math.BigDecimal;

public class IngredientResponse {

    private Long id;
    private String name;
    private String description;
    private StockUnit unit;
    private BigDecimal currentStock;
    private BigDecimal lowStockThreshold;
    private BigDecimal costPerUnit;
    private Boolean lowStockAlert;   // computed flag

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StockUnit getUnit() { return unit; }
    public void setUnit(StockUnit unit) { this.unit = unit; }

    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }

    public BigDecimal getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(BigDecimal lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public BigDecimal getCostPerUnit() { return costPerUnit; }
    public void setCostPerUnit(BigDecimal costPerUnit) { this.costPerUnit = costPerUnit; }

    public Boolean getLowStockAlert() { return lowStockAlert; }
    public void setLowStockAlert(Boolean lowStockAlert) { this.lowStockAlert = lowStockAlert; }
}