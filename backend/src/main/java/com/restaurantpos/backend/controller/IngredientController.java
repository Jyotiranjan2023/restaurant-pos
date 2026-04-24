package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.IngredientRequest;
import com.restaurantpos.backend.dto.request.RestockRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.IngredientResponse;
import com.restaurantpos.backend.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final InventoryService inventoryService;

    public IngredientController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<IngredientResponse>> create(
            @Valid @RequestBody IngredientRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Ingredient created",
                inventoryService.createIngredient(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success("Ingredients fetched",
                inventoryService.findAllIngredients()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ingredient fetched",
                inventoryService.findIngredientById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<IngredientResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody IngredientRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Ingredient updated",
                inventoryService.updateIngredient(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        inventoryService.deleteIngredient(id);
        return ResponseEntity.ok(ApiResponse.success("Ingredient deleted", null));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> findLowStock() {
        return ResponseEntity.ok(ApiResponse.success("Low stock ingredients fetched",
                inventoryService.findLowStockIngredients()));
    }

    @PostMapping("/{id}/restock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<IngredientResponse>> restock(
            @PathVariable Long id,
            @Valid @RequestBody RestockRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Stock added",
                inventoryService.restock(id, req)));
    }
}