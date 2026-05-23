package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.CancelSubscriptionRequest;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.restaurantpos.backend.security.UserPrincipal;

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

    /**
     * TEMPORARY TEST ENDPOINT: Manually trigger daily maintenance.
     * Used to test cron logic without waiting for 2 AM.
     * WILL BE REMOVED in production.
     */
    @PostMapping("/test/run-maintenance")
    public ResponseEntity<ApiResponse<String>> testRunMaintenance() {
        int trials = subscriptionService.processExpiredTrials();
        int active = subscriptionService.processExpiredActiveSubscriptions();
        int grace = subscriptionService.processExpiredGracePeriods();
        
        String result = String.format(
            "Maintenance complete. Trials expired: %d, Active expired: %d, Grace suspended: %d",
            trials, active, grace
        );
        return ResponseEntity.ok(new ApiResponse<>(true, result, null));
    }

    /**
     * TEMPORARY TEST ENDPOINT: Manually trigger monthly counter reset.
     */
    @PostMapping("/test/reset-counters")
    public ResponseEntity<ApiResponse<String>> testResetCounters() {
        int reset = subscriptionService.resetMonthlyOrderCounters();
        String result = String.format("Counters reset for %d subscriptions", reset);
        return ResponseEntity.ok(new ApiResponse<>(true, result, null));
    }
    @PostMapping("/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancelSubscription(
            @RequestBody(required = false) CancelSubscriptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String reason = request != null ? request.getReason() : null;
        subscriptionService.cancelSubscription(principal.getTenantId(), reason);

        // Return updated subscription info so frontend can refresh
        SubscriptionResponse info = subscriptionService.getCurrentSubscription(principal.getTenantId());
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            "Subscription cancelled. You will retain access until your current billing period ends.",
            info
        ));
    }
    /**
     * TEMPORARY TEST ENDPOINT — verify SMTP works.
     * REMOVE AFTER TESTING.
     */
    @org.springframework.beans.factory.annotation.Autowired
    private com.restaurantpos.backend.service.EmailService emailService;

    @PostMapping("/test/send-email")
    public ResponseEntity<ApiResponse<String>> testSendEmail(
            @RequestBody java.util.Map<String, String> body) {
        String toEmail = body.get("toEmail");
        if (toEmail == null || toEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "toEmail is required", null));
        }
        emailService.sendPasswordResetEmail(toEmail, "Test User", "ABC123");
        return ResponseEntity.ok(
            new ApiResponse<>(true,
                "Email send triggered. Check inbox (and spam folder).",
                null));
    }
}