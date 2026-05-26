package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.service.WebhookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    /**
     * Razorpay webhook receiver.
     * Razorpay sends events here for: subscription.charged, subscription.activated,
     * subscription.cancelled, payment.failed etc.
     *
     * Security: verified using X-Razorpay-Signature header + webhook secret.
     * Public endpoint — no JWT auth (Razorpay doesn't send JWTs).
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        log.info("Webhook received. Signature present: {}", signature != null);

        if (signature == null || signature.isEmpty()) {
            log.warn("Webhook received without signature — rejected");
            return ResponseEntity.badRequest().body("Missing signature");
        }

        try {
            webhookService.processWebhook(payload, signature);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Webhook processing failed: {}", e.getMessage(), e);
            return ResponseEntity.ok("OK"); // Always return 200 to Razorpay
        }
    }
}