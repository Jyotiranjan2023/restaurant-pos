package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.CreateOrderResponse;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.service.RazorpayOrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private RazorpayOrderService razorpayOrderService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(
            @RequestBody Map<String, String> body) throws Exception {

        Long tenantId = TenantContext.getCurrentTenantId();
        String planCode = body.get("planCode");

        if (planCode == null || planCode.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "planCode is required", null));
        }

        log.info("Create order request: tenant={} plan={}", tenantId, planCode);

        CreateOrderResponse resp = razorpayOrderService.createOrder(tenantId, planCode);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Order created", resp));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyPayment(
            @RequestBody Map<String, String> body) throws Exception {

        Long tenantId = TenantContext.getCurrentTenantId();
        String planCode = body.get("planCode");
        String orderId = body.get("razorpayOrderId");
        String paymentId = body.get("razorpayPaymentId");
        String signature = body.get("razorpaySignature");

        if (planCode == null || orderId == null || paymentId == null || signature == null) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false,
                            "planCode, razorpayOrderId, razorpayPaymentId, razorpaySignature are required",
                            null));
        }

        log.info("Verify payment request: tenant={} plan={} order={} payment={}",
                tenantId, planCode, orderId, paymentId);

        razorpayOrderService.verifyAndActivate(
                tenantId, planCode, orderId, paymentId, signature);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Payment verified. Subscription activated.", null));
    }
}