package com.restaurantpos.backend.service;

import com.restaurantpos.backend.entity.Subscription;
import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.enums.SubscriptionStatus;
import com.restaurantpos.backend.exception.FeatureGateException;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import com.restaurantpos.backend.repository.SubscriptionRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core feature gating logic.
 * 
 * This service is called by FeatureGateAspect to enforce subscription rules.
 * It can also be called directly for custom checks.
 */
@Service
@Transactional(readOnly = true)
public class FeatureGateService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    // ========== MAIN GATE CHECK ==========

    /**
     * Check if current tenant has access to a feature.
     * Throws FeatureGateException if blocked.
     * 
     * @param featureCode Feature flag name (e.g., "has_inventory", "has_coupons")
     */
    public void checkFeature(String featureCode) {
        Long tenantId = TenantContext.getCurrentTenantId();
        checkFeatureForTenant(tenantId, featureCode);
    }

    /**
     * Check feature access for a specific tenant.
     * Used when we need to check for a tenant other than current user.
     */
    public void checkFeatureForTenant(Long tenantId, String featureCode) {
        Subscription sub = getActiveSubscription(tenantId);
        SubscriptionPlan plan = getPlanFromSubscription(sub);

        Boolean hasAccess = readFeatureFlag(plan, featureCode);

        if (!Boolean.TRUE.equals(hasAccess)) {
            throw new FeatureGateException(
                "This feature is not included in your " + plan.getName() + " plan. " +
                "Please upgrade to access this feature.",
                featureCode,
                plan.getName(),
                suggestUpgrade(plan.getCode())
            );
        }
    }

    // ========== LIMIT CHECKS ==========

    /**
     * Check if tenant can create more of a resource based on plan limits.
     * 
     * @param limitCode Limit name (e.g., "max_staff", "max_menu_items")
     * @param currentCount Current count of resources
     */
    public void checkLimit(String limitCode, long currentCount) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Subscription sub = getActiveSubscription(tenantId);
        SubscriptionPlan plan = getPlanFromSubscription(sub);

        Integer maxAllowed = readLimit(plan, limitCode);

        // null = unlimited
        if (maxAllowed == null) {
            return;
        }

        if (currentCount >= maxAllowed) {
            throw new FeatureGateException(
                "You have reached the limit of " + maxAllowed + " for your " + 
                plan.getName() + " plan. Please upgrade to add more.",
                limitCode,
                plan.getName(),
                suggestUpgrade(plan.getCode())
            );
        }
    }

    // ========== ACCESS CHECK (for suspended/cancelled tenants) ==========

    /**
     * Check if tenant can access the system at all.
     * Suspended or cancelled tenants are blocked from everything.
     */
    public void checkSystemAccess() {
        Long tenantId = TenantContext.getCurrentTenantId();
        Subscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new FeatureGateException(
                    "No active subscription found. Please subscribe to continue."
                ));

        if (sub.getStatus() == SubscriptionStatus.SUSPENDED) {
            throw new FeatureGateException(
                "Your subscription is suspended. Please renew to access the system.",
                "subscription_suspended",
                "Suspended",
                "Renew"
            );
        }

        if (sub.getStatus() == SubscriptionStatus.CANCELLED && 
            sub.getExpiresAt() != null && 
            sub.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new FeatureGateException(
                "Your subscription has been cancelled and expired. Please subscribe again.",
                "subscription_cancelled",
                "Cancelled",
                "Resubscribe"
            );
        }
    }

    // ========== ORDER LIMIT CHECK (special handling for monthly counter) ==========

    /**
     * Check if tenant can create a new order based on monthly limit.
     */
    public void checkMonthlyOrderLimit() {
        Long tenantId = TenantContext.getCurrentTenantId();
        Subscription sub = getActiveSubscription(tenantId);
        SubscriptionPlan plan = getPlanFromSubscription(sub);

        Integer maxOrders = plan.getMaxOrdersPerMonth();

        // null = unlimited
        if (maxOrders == null) {
            return;
        }

        Integer currentMonthOrders = sub.getCurrentMonthOrders();
        if (currentMonthOrders == null) currentMonthOrders = 0;

        if (currentMonthOrders >= maxOrders) {
            throw new FeatureGateException(
                "You have reached your monthly order limit of " + maxOrders + 
                " for your " + plan.getName() + " plan. " +
                "Limit resets next month, or upgrade for higher limits.",
                "max_orders_per_month",
                plan.getName(),
                suggestUpgrade(plan.getCode())
            );
        }
    }

    // ========== HELPER METHODS ==========

    /**
     * Get the active subscription for a tenant.
     * Throws if no subscription or subscription is in blocking state.
     */
    private Subscription getActiveSubscription(Long tenantId) {
        Subscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new FeatureGateException(
                    "No subscription found for your account. Please subscribe to continue."
                ));

        // Block suspended tenants from everything
        if (sub.getStatus() == SubscriptionStatus.SUSPENDED) {
            throw new FeatureGateException(
                "Your subscription is suspended. Please renew to access this feature.",
                "subscription_suspended",
                "Suspended",
                "Renew"
            );
        }

        return sub;
    }

    /**
     * Get plan from subscription. Throws if plan missing (shouldn't happen).
     */
    private SubscriptionPlan getPlanFromSubscription(Subscription sub) {
        return planRepository.findById(sub.getPlanId())
                .orElseThrow(() -> new FeatureGateException(
                    "Subscription plan not found. Please contact support."
                ));
    }

    /**
     * Read a boolean feature flag from the plan by feature code.
     * This is the mapping between feature code string and plan field.
     */
    private Boolean readFeatureFlag(SubscriptionPlan plan, String featureCode) {
        switch (featureCode) {
            case "has_inventory": return plan.getHasInventory();
            case "has_recipes": return plan.getHasRecipes();
            case "has_coupons": return plan.getHasCoupons();
            case "has_kitchen_display": return plan.getHasKitchenDisplay();
            case "has_feedback": return plan.getHasFeedback();
            case "has_csv_export": return plan.getHasCsvExport();
            case "has_all_reports": return plan.getHasAllReports();
            case "has_email_notifications": return plan.getHasEmailNotifications();
            case "has_whatsapp_notifications": return plan.getHasWhatsappNotifications();
            case "has_custom_branding": return plan.getHasCustomBranding();
            case "has_logo_upload": return plan.getHasLogoUpload();
            case "has_api_access": return plan.getHasApiAccess();
            case "has_priority_support": return plan.getHasPrioritySupport();
            default:
                throw new IllegalArgumentException("Unknown feature code: " + featureCode);
        }
    }

    /**
     * Read a numeric limit from the plan by limit code.
     * Returns null = unlimited.
     */
    private Integer readLimit(SubscriptionPlan plan, String limitCode) {
        switch (limitCode) {
            case "max_staff": return plan.getMaxStaff();
            case "max_menu_items": return plan.getMaxMenuItems();
            case "max_tables": return plan.getMaxTables();
            case "max_categories": return plan.getMaxCategories();
            case "max_orders_per_month": return plan.getMaxOrdersPerMonth();
            default:
                throw new IllegalArgumentException("Unknown limit code: " + limitCode);
        }
    }

    /**
     * Suggest next plan to upgrade to.
     */
    private String suggestUpgrade(String currentPlanCode) {
        switch (currentPlanCode) {
            case "BASIC": return "Pro";
            case "PRO": return "Enterprise";
            case "ENTERPRISE": return "Enterprise";  // already top
            default: return "Pro";
        }
    }

    // ========== UTILITY METHODS (for direct queries from other services) ==========

    /**
     * Check if tenant has a feature without throwing.
     * Returns true/false instead of exception.
     * Useful for conditional UI logic.
     */
    public boolean hasFeature(String featureCode) {
        try {
            checkFeature(featureCode);
            return true;
        } catch (FeatureGateException e) {
            return false;
        }
    }

    /**
     * Get current tenant's plan.
     */
    public SubscriptionPlan getCurrentPlan() {
        Long tenantId = TenantContext.getCurrentTenantId();
        Subscription sub = getActiveSubscription(tenantId);
        return getPlanFromSubscription(sub);
    }
}