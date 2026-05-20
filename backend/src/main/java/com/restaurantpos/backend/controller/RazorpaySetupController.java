package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.service.RazorpayPlanSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin-only setup endpoints for Razorpay.
 * Use these once to bootstrap plans, then can be removed.
 */
@RestController
@RequestMapping("/api/super-admin/razorpay")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class RazorpaySetupController {

    private final RazorpayPlanSyncService planSyncService;

    public RazorpaySetupController(RazorpayPlanSyncService planSyncService) {
        this.planSyncService = planSyncService;
    }

    @PostMapping("/sync-plans")
    public ResponseEntity<ApiResponse<List<String>>> syncPlans() {
        List<String> results = planSyncService.syncAllPlans();
        return ResponseEntity.ok(ApiResponse.success("Plan sync complete", results));
    }
}