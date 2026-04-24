package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.StockUnit;
import java.math.BigDecimal;

public class RecipeItemResponse {

    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private StockUnit unit;
    private BigDecimal quantityPerServing;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public String getIngredientName() { return ingredientName; }
    public void setIngredientName(String ingredientName) { this.ingredientName = ingredientName; }

    public StockUnit getUnit() { return unit; }
    public void setUnit(StockUnit unit) { this.unit = unit; }

    public BigDecimal getQuantityPerServing() { return quantityPerServing; }
    public void setQuantityPerServing(BigDecimal quantityPerServing) { this.quantityPerServing = quantityPerServing; }
}