package com.restaurantpos.backend.service;

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
	// 7-day free trial duration (as decided in architecture)
    private static final int TRIAL_DAYS = 7;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;
    @Autowired
    private TenantRepository tenantRepository;

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

    /**
     * Create a 7-day TRIAL subscription for a new tenant.
     * Used by AuthService when a new restaurant signs up.
     * 
     * Trial gets ENTERPRISE plan access (so they can try all features).
     * Tenant must convert to paid plan before trial ends.
     */
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
     * Calculate days remaining until expiry.
     * Returns null for LIFETIME_FREE.
     */
    private Integer calculateDaysRemaining(Subscription sub) {
        if (sub.getStatus() == SubscriptionStatus.LIFETIME_FREE) {
            return null; // No expiry concept
        }
        
        LocalDateTime relevant = sub.getExpiresAt();
        if (sub.getStatus() == SubscriptionStatus.TRIAL && sub.getTrialEndsAt() != null) {
            relevant = sub.getTrialEndsAt();
        } else if (sub.getStatus() == SubscriptionStatus.GRACE_PERIOD && sub.getGracePeriodEndsAt() != null) {
            relevant = sub.getGracePeriodEndsAt();
        }
        
        if (relevant == null) return 0;
        
        long days = ChronoUnit.DAYS.between(LocalDateTime.now(), relevant);
        return (int) Math.max(0, days);
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
}