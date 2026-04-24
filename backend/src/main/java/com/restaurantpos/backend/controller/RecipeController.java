package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.RecipeItemRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.RecipeItemResponse;
import com.restaurantpos.backend.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/recipe")
public class RecipeController {

    private final InventoryService inventoryService;

    public RecipeController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RecipeItemResponse>> addRecipeItem(
            @PathVariable Long productId,
            @Valid @RequestBody RecipeItemRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Recipe item added/updated",
                inventoryService.addRecipeItem(productId, req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecipeItemResponse>>> getRecipe(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Recipe fetched",
                inventoryService.getRecipe(productId)));
    }

    @DeleteMapping("/{ingredientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> removeRecipeItem(
            @PathVariable Long productId,
            @PathVariable Long ingredientId) {
        inventoryService.removeRecipeItem(productId, ingredientId);
        return ResponseEntity.ok(ApiResponse.success("Recipe item removed", null));
    }
}