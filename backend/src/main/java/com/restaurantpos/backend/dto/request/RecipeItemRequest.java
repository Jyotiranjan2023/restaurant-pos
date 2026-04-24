package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class RecipeItemRequest {

    @NotNull(message = "Ingredient ID is required")
    private Long ingredientId;

    @NotNull(message = "Quantity per serving is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    private BigDecimal quantityPerServing;

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public BigDecimal getQuantityPerServing() { return quantityPerServing; }
    public void setQuantityPerServing(BigDecimal quantityPerServing) { this.quantityPerServing = quantityPerServing; }
}