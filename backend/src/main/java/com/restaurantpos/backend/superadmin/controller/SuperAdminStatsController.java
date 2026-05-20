package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.superadmin.dto.SuperAdminStatsResponse;
import com.restaurantpos.backend.superadmin.service.SuperAdminStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/super-admin/stats")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminStatsController {

    private final SuperAdminStatsService statsService;

    public SuperAdminStatsController(SuperAdminStatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SuperAdminStatsResponse>> getStats() {
        SuperAdminStatsResponse stats = statsService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
    }
}