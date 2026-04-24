package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.ProductAddonRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.ProductAddonResponse;
import com.restaurantpos.backend.service.ProductAddonService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/addons")
public class ProductAddonController {

    private final ProductAddonService addonService;

    public ProductAddonController(ProductAddonService addonService) {
        this.addonService = addonService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductAddonResponse>> create(
            @PathVariable Long productId,
            @Valid @RequestBody ProductAddonRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Addon created",
                addonService.create(productId, req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductAddonResponse>>> findAll(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Addons fetched",
                addonService.findByProduct(productId)));
    }

    @PutMapping("/{addonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductAddonResponse>> update(
            @PathVariable Long productId,
            @PathVariable Long addonId,
            @Valid @RequestBody ProductAddonRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Addon updated",
                addonService.update(productId, addonId, req)));
    }

    @DeleteMapping("/{addonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(
            @PathVariable Long productId,
            @PathVariable Long addonId) {
        addonService.delete(productId, addonId);
        return ResponseEntity.ok(ApiResponse.success("Addon deleted", null));
    }
}