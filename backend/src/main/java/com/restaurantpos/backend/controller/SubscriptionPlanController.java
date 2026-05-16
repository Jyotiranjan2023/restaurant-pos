package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.CreatePlanRequest;
import com.restaurantpos.backend.dto.request.UpdatePlanRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.PlanResponse;
import com.restaurantpos.backend.service.SubscriptionPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription-plans")
public class SubscriptionPlanController {

    @Autowired
    private SubscriptionPlanService planService;

    // ========== PUBLIC ENDPOINTS (visible plans for signup page) ==========

    /**
     * Get all visible + active plans
     * Used on tenant signup page to show available pricing
     * No auth required
     */
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<PlanResponse>>> getVisiblePlans() {
        List<PlanResponse> plans = planService.getVisiblePlans();
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Visible plans fetched successfully", plans)
        );
    }

    // ========== AUTHENTICATED ENDPOINTS (will lock to SUPER_ADMIN later) ==========

    /**
     * Get all plans (including inactive)
     * TODO: Lock to SUPER_ADMIN after super admin role is built
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PlanResponse>>> getAllPlans() {
        List<PlanResponse> plans = planService.getAllPlans();
        return ResponseEntity.ok(
            new ApiResponse<>(true, "All plans fetched successfully", plans)
        );
    }

    /**
     * Get active plans (for internal use)
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PlanResponse>>> getActivePlans() {
        List<PlanResponse> plans = planService.getActivePlans();
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Active plans fetched successfully", plans)
        );
    }

    /**
     * Get single plan by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanResponse>> getPlanById(@PathVariable Long id) {
        PlanResponse plan = planService.getPlanById(id);
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Plan fetched successfully", plan)
        );
    }

    /**
     * Get plan by code (BASIC, PRO, ENTERPRISE)
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<PlanResponse>> getPlanByCode(@PathVariable String code) {
        PlanResponse plan = planService.getPlanByCode(code);
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Plan fetched successfully", plan)
        );
    }

    /**
     * Create a new plan
     * TODO: Lock to SUPER_ADMIN after super admin role is built
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PlanResponse>> createPlan(
            @Valid @RequestBody CreatePlanRequest request) {
        PlanResponse plan = planService.createPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            new ApiResponse<>(true, "Plan created successfully", plan)
        );
    }

    /**
     * Update existing plan
     * TODO: Lock to SUPER_ADMIN after super admin role is built
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanResponse>> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePlanRequest request) {
        PlanResponse plan = planService.updatePlan(id, request);
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Plan updated successfully", plan)
        );
    }

    /**
     * Soft delete plan (mark inactive)
     * TODO: Lock to SUPER_ADMIN after super admin role is built
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivatePlan(@PathVariable Long id) {
        planService.deactivatePlan(id);
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Plan deactivated successfully", null)
        );
    }

    /**
     * Toggle visibility (show/hide on signup page)
     */
    @PatchMapping("/{id}/toggle-visibility")
    public ResponseEntity<ApiResponse<PlanResponse>> toggleVisibility(@PathVariable Long id) {
        PlanResponse plan = planService.toggleVisibility(id);
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Plan visibility toggled successfully", plan)
        );
    }
}