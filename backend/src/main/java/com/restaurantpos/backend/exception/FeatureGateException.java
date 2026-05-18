package com.restaurantpos.backend.exception;

/**
 * Thrown when a subscription plan does not include a requested feature,
 * or when a usage limit has been reached.
 * 
 * Examples:
 * - Basic plan tenant tries to access inventory (feature not included)
 * - Basic plan tenant tries to add 51st menu item (limit reached)
 * - Suspended tenant tries to do anything (no access)
 */
public class FeatureGateException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String featureCode;
    private final String currentPlan;
    private final String suggestedPlan;

    /**
     * Generic constructor with just message.
     */
    public FeatureGateException(String message) {
        super(message);
        this.featureCode = null;
        this.currentPlan = null;
        this.suggestedPlan = null;
    }

    /**
     * Detailed constructor with upgrade context.
     * Helps frontend show "Upgrade to Pro" buttons.
     */
    public FeatureGateException(String message, String featureCode, 
                                 String currentPlan, String suggestedPlan) {
        super(message);
        this.featureCode = featureCode;
        this.currentPlan = currentPlan;
        this.suggestedPlan = suggestedPlan;
    }

    public String getFeatureCode() {
        return featureCode;
    }

    public String getCurrentPlan() {
        return currentPlan;
    }

    public String getSuggestedPlan() {
        return suggestedPlan;
    }
}