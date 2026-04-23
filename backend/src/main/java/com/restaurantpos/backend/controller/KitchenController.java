package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.KitchenStatusRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.KitchenItemResponse;
import com.restaurantpos.backend.service.KitchenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<KitchenItemResponse>>> getKitchenItems() {
        return ResponseEntity.ok(ApiResponse.success("Kitchen items fetched",
                kitchenService.getKitchenItems()));
    }

    @GetMapping("/items/ready")
    public ResponseEntity<ApiResponse<List<KitchenItemResponse>>> getReadyItems() {
        return ResponseEntity.ok(ApiResponse.success("Ready items fetched",
                kitchenService.getReadyItems()));
    }

    @PatchMapping("/items/{itemId}/status")
    public ResponseEntity<ApiResponse<KitchenItemResponse>> updateStatus(
            @PathVariable Long itemId,
            @Valid @RequestBody KitchenStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Item status updated",
                kitchenService.updateItemStatus(itemId, req)));
    }
}