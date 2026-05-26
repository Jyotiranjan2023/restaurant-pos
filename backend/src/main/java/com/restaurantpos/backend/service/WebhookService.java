package com.restaurantpos.backend.service;

import com.razorpay.Utils;
import com.restaurantpos.backend.repository.SubscriptionRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;

    public WebhookService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionService subscriptionService) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionService = subscriptionService;
    }

    /**
     * Process incoming Razorpay webhook.
     * 1. Verify signature
     * 2. Parse event type
     * 3. Handle relevant events
     */
    public void processWebhook(String payload, String signature) throws Exception {

        // 1. Verify signature
        boolean isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
        if (!isValid) {
            log.warn("Invalid webhook signature — ignoring");
            throw new RuntimeException("Invalid webhook signature");
        }

        // 2. Parse event
        JSONObject event = new JSONObject(payload);
        String eventType = event.optString("event", "");

        log.info("Webhook event received: {}", eventType);

        // 3. Handle events
        switch (eventType) {

            case "subscription.charged":
                handleSubscriptionCharged(event);
                break;

            case "subscription.activated":
                handleSubscriptionActivated(event);
                break;

            case "subscription.cancelled":
                handleSubscriptionCancelled(event);
                break;

            case "payment.failed":
                handlePaymentFailed(event);
                break;

            default:
                log.info("Unhandled webhook event type: {}", eventType);
                break;
        }
    }

    /**
     * subscription.charged — recurring payment was successful.
     * Extend subscription by 30 days (or reset to next billing date).
     */
    private void handleSubscriptionCharged(JSONObject event) {
        try {
            JSONObject payload = event.getJSONObject("payload");
            JSONObject subscription = payload.getJSONObject("subscription").getJSONObject("entity");
            JSONObject payment = payload.getJSONObject("payment").getJSONObject("entity");

            String razorpaySubscriptionId = subscription.getString("id");
            String razorpayPaymentId = payment.getString("id");
            String planId = subscription.getString("plan_id");
            int currentCycle = subscription.optInt("paid_count", 1);

            log.info("Subscription charged: sub={} pay={} plan={} cycle={}",
                    razorpaySubscriptionId, razorpayPaymentId, planId, currentCycle);

            // Find local subscription by razorpay subscription ID
            subscriptionRepository.findByRazorpaySubscriptionId(razorpaySubscriptionId)
                    .ifPresentOrElse(
                            localSub -> {
                                try {
                                    subscriptionService.activateAfterSubscriptionPayment(
                                            localSub.getTenantId(),
                                            razorpaySubscriptionId,
                                            razorpayPaymentId,
                                            planId
                                           
                                    );
                                    log.info("Subscription activated for tenant {} via webhook",
                                            localSub.getTenantId());
                                } catch (Exception e) {
                                    log.error("Failed to activate subscription for tenant {}: {}",
                                            localSub.getTenantId(), e.getMessage());
                                }
                            },
                            () -> log.warn("No local subscription found for razorpay sub ID: {}",
                                    razorpaySubscriptionId)
                    );
        } catch (Exception e) {
            log.error("Error processing subscription.charged: {}", e.getMessage(), e);
        }
    }

    /**
     * subscription.activated — subscription is active after first payment.
     * Same as charged for our purposes.
     */
    private void handleSubscriptionActivated(JSONObject event) {
        log.info("Subscription activated event received");
        handleSubscriptionCharged(event);
    }

    /**
     * subscription.cancelled — customer cancelled subscription.
     * Mark as cancelled in our DB.
     */
    private void handleSubscriptionCancelled(JSONObject event) {
        try {
            JSONObject payload = event.getJSONObject("payload");
            JSONObject subscription = payload.getJSONObject("subscription").getJSONObject("entity");
            String razorpaySubscriptionId = subscription.getString("id");

            log.info("Subscription cancelled via webhook: {}", razorpaySubscriptionId);

            subscriptionRepository.findByRazorpaySubscriptionId(razorpaySubscriptionId)
                    .ifPresent(localSub -> {
                        try {
                            subscriptionService.cancelSubscription(
                                    localSub.getTenantId(),
                                    "Cancelled via Razorpay"
                            );
                            log.info("Subscription cancelled for tenant {} via webhook",
                                    localSub.getTenantId());
                        } catch (Exception e) {
                            log.error("Failed to cancel subscription for tenant {}: {}",
                                    localSub.getTenantId(), e.getMessage());
                        }
                    });
        } catch (Exception e) {
            log.error("Error processing subscription.cancelled: {}", e.getMessage(), e);
        }
    }

    /**
     * payment.failed — payment attempt failed.
     * Log for now. Could trigger grace period in future.
     */
    private void handlePaymentFailed(JSONObject event) {
        try {
            JSONObject payload = event.getJSONObject("payload");
            JSONObject payment = payload.getJSONObject("payment").getJSONObject("entity");
            String paymentId = payment.getString("id");
            String description = payment.optString("error_description", "Unknown error");

            log.warn("Payment failed: paymentId={} reason={}", paymentId, description);
        } catch (Exception e) {
            log.error("Error processing payment.failed: {}", e.getMessage(), e);
        }
    }
}