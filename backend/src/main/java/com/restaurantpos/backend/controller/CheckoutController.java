package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.CheckoutRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.CheckoutResponse;
import com.restaurantpos.backend.security.UserPrincipal;
import com.restaurantpos.backend.service.RazorpaySubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subscriptions")
@PreAuthorize("hasRole('ADMIN')")
public class CheckoutController {

    private final RazorpaySubscriptionService subscriptionService;

    public CheckoutController(RazorpaySubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<CheckoutResponse>> createCheckout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UserPrincipal principal) throws Exception {

        CheckoutResponse response = subscriptionService.createCheckout(
                principal.getTenantId(),
                request.getPlanCode()
        );

        return ResponseEntity.ok(ApiResponse.success("Checkout created", response));
    }
}