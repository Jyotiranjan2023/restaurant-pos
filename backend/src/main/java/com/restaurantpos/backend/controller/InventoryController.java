package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.UsageLogResponse;
import com.restaurantpos.backend.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/usage-logs")
    public ResponseEntity<ApiResponse<List<UsageLogResponse>>> getAllLogs() {
        return ResponseEntity.ok(ApiResponse.success("Usage logs fetched",
                inventoryService.findAllUsageLogs()));
    }

    @GetMapping("/usage-logs/today")
    public ResponseEntity<ApiResponse<List<UsageLogResponse>>> getTodaysLogs() {
        return ResponseEntity.ok(ApiResponse.success("Today's usage logs fetched",
                inventoryService.findTodaysUsageLogs()));
    }
}