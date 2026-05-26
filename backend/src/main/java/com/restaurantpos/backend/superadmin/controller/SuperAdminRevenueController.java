package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.superadmin.dto.SuperAdminRevenueResponse;
import com.restaurantpos.backend.superadmin.service.SuperAdminRevenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/super-admin/revenue")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminRevenueController {

    private final SuperAdminRevenueService revenueService;

    public SuperAdminRevenueController(SuperAdminRevenueService revenueService) {
        this.revenueService = revenueService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SuperAdminRevenueResponse>> getRevenue() {
        SuperAdminRevenueResponse data = revenueService.getRevenue();
        return ResponseEntity.ok(ApiResponse.success("Revenue data fetched", data));
    }
}