package com.restaurantpos.backend.superadmin.dto;

public class SuperAdminSettingsRequest {

    // ── General ──────────────────────────────────────────
    private Integer trialDays;
    private Integer graceDays;
    private String defaultPlan;
    private String timezone;

    // ── Feature flags ────────────────────────────────────
    private Boolean autoSuspendOnExpiry;
    private Boolean razorpayWebhooksEnabled;
    private Boolean allowNewRegistration;
    private Boolean maintenanceMode;

    // ── Notifications ────────────────────────────────────
    private Boolean trialExpiryAlertEnabled;
    private Boolean newTenantSignupAlertEnabled;
    private Boolean paymentFailureAlertEnabled;
    private Boolean dailyDigestEnabled;
    private String alertEmail;

    // ── Security ─────────────────────────────────────────
    private Integer sessionTimeoutMinutes;
    private Boolean strongPasswordsRequired;
    private Boolean ipLoggingEnabled;

    // ── Billing ──────────────────────────────────────────
    private String razorpayKeyId;
    private String razorpayWebhookSecret;
    private Boolean razorpayTestMode;
    private String currency;
    private Boolean gstEnabled;

    // Getters and Setters

    public Integer getTrialDays() {
        return trialDays;
    }

    public void setTrialDays(Integer trialDays) {
        this.trialDays = trialDays;
    }

    public Integer getGraceDays() {
        return graceDays;
    }

    public void setGraceDays(Integer graceDays) {
        this.graceDays = graceDays;
    }

    public String getDefaultPlan() {
        return defaultPlan;
    }

    public void setDefaultPlan(String defaultPlan) {
        this.defaultPlan = defaultPlan;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Boolean getAutoSuspendOnExpiry() {
        return autoSuspendOnExpiry;
    }

    public void setAutoSuspendOnExpiry(Boolean autoSuspendOnExpiry) {
        this.autoSuspendOnExpiry = autoSuspendOnExpiry;
    }

    public Boolean getRazorpayWebhooksEnabled() {
        return razorpayWebhooksEnabled;
    }

    public void setRazorpayWebhooksEnabled(Boolean razorpayWebhooksEnabled) {
        this.razorpayWebhooksEnabled = razorpayWebhooksEnabled;
    }

    public Boolean getAllowNewRegistration() {
        return allowNewRegistration;
    }

    public void setAllowNewRegistration(Boolean allowNewRegistration) {
        this.allowNewRegistration = allowNewRegistration;
    }

    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(Boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public Boolean getTrialExpiryAlertEnabled() {
        return trialExpiryAlertEnabled;
    }

    public void setTrialExpiryAlertEnabled(Boolean trialExpiryAlertEnabled) {
        this.trialExpiryAlertEnabled = trialExpiryAlertEnabled;
    }

    public Boolean getNewTenantSignupAlertEnabled() {
        return newTenantSignupAlertEnabled;
    }

    public void setNewTenantSignupAlertEnabled(Boolean newTenantSignupAlertEnabled) {
        this.newTenantSignupAlertEnabled = newTenantSignupAlertEnabled;
    }

    public Boolean getPaymentFailureAlertEnabled() {
        return paymentFailureAlertEnabled;
    }

    public void setPaymentFailureAlertEnabled(Boolean paymentFailureAlertEnabled) {
        this.paymentFailureAlertEnabled = paymentFailureAlertEnabled;
    }

    public Boolean getDailyDigestEnabled() {
        return dailyDigestEnabled;
    }

    public void setDailyDigestEnabled(Boolean dailyDigestEnabled) {
        this.dailyDigestEnabled = dailyDigestEnabled;
    }

    public String getAlertEmail() {
        return alertEmail;
    }

    public void setAlertEmail(String alertEmail) {
        this.alertEmail = alertEmail;
    }

    public Integer getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public void setSessionTimeoutMinutes(Integer sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

    public Boolean getStrongPasswordsRequired() {
        return strongPasswordsRequired;
    }

    public void setStrongPasswordsRequired(Boolean strongPasswordsRequired) {
        this.strongPasswordsRequired = strongPasswordsRequired;
    }

    public Boolean getIpLoggingEnabled() {
        return ipLoggingEnabled;
    }

    public void setIpLoggingEnabled(Boolean ipLoggingEnabled) {
        this.ipLoggingEnabled = ipLoggingEnabled;
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    public void setRazorpayKeyId(String razorpayKeyId) {
        this.razorpayKeyId = razorpayKeyId;
    }

    public String getRazorpayWebhookSecret() {
        return razorpayWebhookSecret;
    }

    public void setRazorpayWebhookSecret(String razorpayWebhookSecret) {
        this.razorpayWebhookSecret = razorpayWebhookSecret;
    }

    public Boolean getRazorpayTestMode() {
        return razorpayTestMode;
    }

    public void setRazorpayTestMode(Boolean razorpayTestMode) {
        this.razorpayTestMode = razorpayTestMode;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Boolean getGstEnabled() {
        return gstEnabled;
    }

    public void setGstEnabled(Boolean gstEnabled) {
        this.gstEnabled = gstEnabled;
    }
}