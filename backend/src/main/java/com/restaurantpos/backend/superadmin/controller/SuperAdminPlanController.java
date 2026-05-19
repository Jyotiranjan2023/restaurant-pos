package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.superadmin.service.SuperAdminPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin/plans")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminPlanController {

    private final SuperAdminPlanService planService;

    public SuperAdminPlanController(SuperAdminPlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> listAllPlans() {
        List<SubscriptionPlan> plans = planService.getAllPlans();
        return ResponseEntity.ok(ApiResponse.success("All plans fetched", plans));
    }
}