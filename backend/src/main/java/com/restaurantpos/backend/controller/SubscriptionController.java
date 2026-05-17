package com.restaurantpos.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.SubscriptionResponse;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * Get current subscription for logged-in user's tenant.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getMySubscription() {

        Long tenantId = TenantContext.getCurrentTenantId();

        SubscriptionResponse subscription =
                subscriptionService.getCurrentSubscription(tenantId);

        return ResponseEntity.ok(
                new ApiResponse<>(true,
                        "Subscription fetched successfully",
                        subscription)
        );
    }

    /**
     * TEMPORARY TEST ENDPOINT: Create trial for any tenant.
     */
    @PostMapping("/test/create-trial/{tenantId}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> testCreateTrial(
            @PathVariable Long tenantId) {

        SubscriptionResponse trial =
                subscriptionService.createTrialSubscription(tenantId);

        return ResponseEntity.ok(
                new ApiResponse<>(true,
                        "Trial subscription created",
                        trial)
        );
    }
}