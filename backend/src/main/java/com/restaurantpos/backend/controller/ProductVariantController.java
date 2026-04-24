package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.ProductVariantRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.ProductVariantResponse;
import com.restaurantpos.backend.service.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variants")
public class ProductVariantController {

    private final ProductVariantService variantService;

    public ProductVariantController(ProductVariantService variantService) {
        this.variantService = variantService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> create(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Variant created",
                variantService.create(productId, req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> findAll(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Variants fetched",
                variantService.findByProduct(productId)));
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> update(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Variant updated",
                variantService.update(productId, variantId, req)));
    }

    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(
            @PathVariable Long productId,
            @PathVariable Long variantId) {
        variantService.delete(productId, variantId);
        return ResponseEntity.ok(ApiResponse.success("Variant deleted", null));
    }
}