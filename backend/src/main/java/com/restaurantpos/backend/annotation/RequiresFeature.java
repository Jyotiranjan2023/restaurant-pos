package com.restaurantpos.backend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a controller method as requiring a specific subscription feature.
 * 
 * When a request hits the method, FeatureGateAspect intercepts and checks
 * if the tenant's plan includes the required feature.
 * 
 * Usage:
 * 
 *   @RequiresFeature("has_inventory")
 *   @GetMapping("/api/ingredients")
 *   public List<Ingredient> getAll() { ... }
 * 
 * If tenant's plan doesn't have has_inventory = true, request is blocked
 * with HTTP 402 Payment Required.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresFeature {

    /**
     * The feature code to check.
     * Must match a field in SubscriptionPlan entity.
     * 
     * Valid codes:
     * - has_inventory
     * - has_recipes
     * - has_coupons
     * - has_kitchen_display
     * - has_feedback
     * - has_csv_export
     * - has_all_reports
     * - has_email_notifications
     * - has_whatsapp_notifications
     * - has_custom_branding
     * - has_logo_upload
     * - has_api_access
     * - has_priority_support
     */
    String value();
}