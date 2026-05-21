package com.restaurantpos.backend.service;

import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.enums.SubscriptionStatus;
import java.time.LocalDateTime;
import java.util.List;

import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.repository.TenantRepository;

import com.restaurantpos.backend.dto.response.SubscriptionResponse;

import com.restaurantpos.backend.entity.Subscription;
import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.enums.SubscriptionStatus;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import com.restaurantpos.backend.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@Transactional
public class SubscriptionService {
	private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SubscriptionService.class);
	// 7-day free trial duration (as decided in architecture)
    private static final int TRIAL_DAYS = 7;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;
    @Autowired
    private TenantRepository tenantRepository;
    @Autowired
    private RazorpaySubscriptionService razorpaySubscriptionService;

    // ========== READ OPERATIONS ==========

    /**
     * Get the current subscription for a tenant.
     * Returns null if tenant has no subscription (shouldn't happen in practice).
     */
    @Transactional(readOnly = true)
    public SubscriptionResponse getCurrentSubscription(Long tenantId) {
        Subscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new RuntimeException(
                    "No subscription found for tenant ID: " + tenantId
                ));
        return toResponse(sub);
    }

    /**
     * Check if tenant has any subscription.
     */
    @Transactional(readOnly = true)
    public boolean hasSubscription(Long tenantId) {
        return subscriptionRepository.existsByTenantId(tenantId);
    }

    /**
     * Get raw subscription entity by tenant ID.
     * Used internally by other services (not exposed to API).
     */
    @Transactional(readOnly = true)
    public Subscription getRawSubscriptionByTenant(Long tenantId) {
        return subscriptionRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new RuntimeException(
                    "No subscription found for tenant ID: " + tenantId
                ));
    }

    // ========== HELPER METHODS ==========
    
 // ========== WRITE OPERATIONS ==========

    
    public SubscriptionResponse createTrialSubscription(Long tenantId) {
        // Safety check: don't create duplicate subscription
        if (subscriptionRepository.existsByTenantId(tenantId)) {
            throw new RuntimeException(
                "Tenant " + tenantId + " already has a subscription"
            );
        }

        // Verify tenant exists
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException(
                    "Tenant not found with id: " + tenantId
                ));

        // Get ENTERPRISE plan (trials get full access to test all features)
        SubscriptionPlan trialPlan = planRepository.findByCode("ENTERPRISE")
                .orElseThrow(() -> new RuntimeException(
                    "ENTERPRISE plan not found. Cannot create trial."
                ));

        // Create trial subscription
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime trialEnd = now.plusDays(TRIAL_DAYS);

        Subscription trial = new Subscription();
        trial.setTenantId(tenantId);
        trial.setPlanId(trialPlan.getId());
        trial.setStatus(SubscriptionStatus.TRIAL);
        trial.setStartedAt(now);
        trial.setExpiresAt(trialEnd);
        trial.setTrialEndsAt(trialEnd);
        trial.setCurrentMonthOrders(0);
        trial.setLastOrderCountResetAt(now);

        Subscription saved = subscriptionRepository.save(trial);

        // Link tenant to this subscription
        tenant.setCurrentSubscriptionId(saved.getId());
        tenantRepository.save(tenant);

        return toResponse(saved);
    }
    
 // ========== MAINTENANCE OPERATIONS (called by scheduler) ==========

    /**
     * Find all TRIAL subscriptions where trial period has ended.
     * Transition them to GRACE_PERIOD (give 7 days to pay).
     */
    public int processExpiredTrials() {
        List<Subscription> expiredTrials = subscriptionRepository.findExpiredTrials(
                SubscriptionStatus.TRIAL,
                LocalDateTime.now()
        );

        int count = 0;
        for (Subscription sub : expiredTrials) {
            sub.setStatus(SubscriptionStatus.GRACE_PERIOD);
            sub.setGracePeriodEndsAt(LocalDateTime.now().plusDays(7));
            subscriptionRepository.save(sub);
            count++;
        }
        return count;
    }

    /**
     * Find all ACTIVE subscriptions where renewal date has passed.
     * Renewal payment must have failed — move to GRACE_PERIOD.
     */
    public int processExpiredActiveSubscriptions() {
        List<Subscription> expired = subscriptionRepository.findExpiredActive(
                SubscriptionStatus.ACTIVE,
                LocalDateTime.now()
        );

        int count = 0;
        for (Subscription sub : expired) {
            sub.setStatus(SubscriptionStatus.GRACE_PERIOD);
            sub.setGracePeriodEndsAt(LocalDateTime.now().plusDays(7));
            subscriptionRepository.save(sub);
            count++;
        }
        return count;
    }

    /**
     * Find all GRACE_PERIOD subscriptions where grace period has ended.
     * Suspend them — block all access.
     */
    public int processExpiredGracePeriods() {
        List<Subscription> expired = subscriptionRepository.findExpiredGracePeriods(
                SubscriptionStatus.GRACE_PERIOD,
                LocalDateTime.now()
        );

        int count = 0;
        for (Subscription sub : expired) {
            sub.setStatus(SubscriptionStatus.SUSPENDED);
            subscriptionRepository.save(sub);
            count++;
        }
        return count;
    }

    /**
     * Reset monthly order counter for all subscriptions.
     * Called on the 1st of each month.
     * 
     * Only resets if last_order_count_reset_at was more than 25 days ago
     * (protects against running this multiple times in one day).
     */
    public int resetMonthlyOrderCounters() {
        List<Subscription> allSubs = subscriptionRepository.findAll();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(25);
        
        int count = 0;
        for (Subscription sub : allSubs) {
            if (sub.getLastOrderCountResetAt() == null 
                || sub.getLastOrderCountResetAt().isBefore(cutoff)) {
                sub.setCurrentMonthOrders(0);
                sub.setLastOrderCountResetAt(LocalDateTime.now());
                subscriptionRepository.save(sub);
                count++;
            }
        }
        return count;
    }

    /**
     * Convert Subscription entity to response DTO.
     * Adds computed fields (daysRemaining, displayStatus, etc.)
     */
    private SubscriptionResponse toResponse(Subscription sub) {
        SubscriptionResponse response = new SubscriptionResponse();
        
        response.setId(sub.getId());
        response.setTenantId(sub.getTenantId());
        response.setPlanId(sub.getPlanId());
        response.setStatus(sub.getStatus());
        response.setStartedAt(sub.getStartedAt());
        response.setExpiresAt(sub.getExpiresAt());
        response.setTrialEndsAt(sub.getTrialEndsAt());
        response.setGracePeriodEndsAt(sub.getGracePeriodEndsAt());
        response.setCancelledAt(sub.getCancelledAt());
        response.setCancelReason(sub.getCancelReason());
        response.setRazorpaySubscriptionId(sub.getRazorpaySubscriptionId());
        response.setRazorpayCustomerId(sub.getRazorpayCustomerId());
        response.setCurrentMonthOrders(sub.getCurrentMonthOrders());
        response.setCreatedAt(sub.getCreatedAt());
        response.setUpdatedAt(sub.getUpdatedAt());
        
        // Fetch plan info
        SubscriptionPlan plan = planRepository.findById(sub.getPlanId())
                .orElse(null);
        if (plan != null) {
            response.setPlanCode(plan.getCode());
            response.setPlanName(plan.getName());
        }
        
        // Computed fields
        response.setIsActive(sub.isActive());
        response.setCanCreateOrders(sub.canCreateOrders());
        response.setDaysRemaining(calculateDaysRemaining(sub));
        response.setDisplayStatus(getDisplayStatus(sub));
        
        return response;
    }

    /**
     * Calculate days remaining until expiry, rounded UP.
     * Returns null for LIFETIME_FREE.
     * 
     * Uses ceiling logic so a deadline 5 days 7 hours away shows as "6 days",
     * matching user expectation and the frontend banner display.
     */
    private Integer calculateDaysRemaining(Subscription sub) {
        if (sub.getStatus() == SubscriptionStatus.LIFETIME_FREE) {
            return null;
        }

        LocalDateTime relevant = sub.getExpiresAt();
        if (sub.getStatus() == SubscriptionStatus.TRIAL && sub.getTrialEndsAt() != null) {
            relevant = sub.getTrialEndsAt();
        } else if (sub.getStatus() == SubscriptionStatus.GRACE_PERIOD && sub.getGracePeriodEndsAt() != null) {
            relevant = sub.getGracePeriodEndsAt();
        }

        if (relevant == null) return 0;

        LocalDateTime now = LocalDateTime.now();
        if (!relevant.isAfter(now)) return 0;

        // Ceiling: any partial day counts as a full day
        long totalSeconds = ChronoUnit.SECONDS.between(now, relevant);
        long secondsPerDay = 86400;
        long days = (totalSeconds + secondsPerDay - 1) / secondsPerDay;  // integer ceiling
        return (int) days;
    }

    /**
     * Generate user-friendly status text for UI display.
     */
    private String getDisplayStatus(Subscription sub) {
        switch (sub.getStatus()) {
            case TRIAL:
                int trialDays = calculateDaysRemaining(sub);
                return "Free trial — " + trialDays + " days left";
            case ACTIVE:
                int activeDays = calculateDaysRemaining(sub);
                return "Active — renews in " + activeDays + " days";
            case GRACE_PERIOD:
                int graceDays = calculateDaysRemaining(sub);
                return "Payment failed — " + graceDays + " days to pay";
            case SUSPENDED:
                return "Subscription expired — please renew";
            case CANCELLED:
                return "Cancelled";
            case LIFETIME_FREE:
                return "Lifetime free access";
            default:
                return sub.getStatus().toString();
        }
    }
    @Transactional
    public Subscription cancelSubscription(Long tenantId, String reason) {

        Subscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found for tenant: " + tenantId));

        // Validation: can't cancel certain states
        if (sub.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new BadRequestException("Subscription is already cancelled");
        }
        if (sub.getStatus() == SubscriptionStatus.SUSPENDED) {
            throw new BadRequestException("Cannot cancel a suspended subscription");
        }
        if (sub.getStatus() == SubscriptionStatus.LIFETIME_FREE) {
            throw new BadRequestException("Lifetime free subscriptions cannot be cancelled by user");
        }
        if (sub.getCancelledAt() != null) {
            throw new BadRequestException("Subscription is already scheduled for cancellation");
        }

        // Mark cancelled — status stays as-is (ACTIVE/TRIAL/GRACE)
        // Daily scheduler will move it to CANCELLED when expires_at passes
        sub.setCancelledAt(LocalDateTime.now());
        sub.setCancelReason(reason != null ? reason.trim() : null);

        // Cancel in Razorpay if there's a subscription there
        if (sub.getRazorpaySubscriptionId() != null && !sub.getRazorpaySubscriptionId().isEmpty()) {
            try {
                razorpaySubscriptionService.cancelRazorpaySubscription(sub.getRazorpaySubscriptionId());
                log.info("Cancelled Razorpay subscription {}", sub.getRazorpaySubscriptionId());
            } catch (Exception e) {
                // Don't block local cancellation if Razorpay call fails
                log.error("Failed to cancel Razorpay subscription {} — local cancellation still proceeded",
                        sub.getRazorpaySubscriptionId(), e);
            }
        }

        Subscription saved = subscriptionRepository.save(sub);
        log.info("Subscription cancelled for tenant {} (reason: {})", tenantId, reason);

        return saved;
    }
}