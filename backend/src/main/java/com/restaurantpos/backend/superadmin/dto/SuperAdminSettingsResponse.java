package com.restaurantpos.backend.superadmin.dto;

public class SuperAdminSettingsResponse {

    // ── General ──────────────────────────────────────────
    private int     trialDays;
    private int     graceDays;
    private String  defaultPlan;
    private String  timezone;

    // ── Feature flags ────────────────────────────────────
    private boolean autoSuspendOnExpiry;
    private boolean razorpayWebhooksEnabled;
    private boolean allowNewRegistration;
    private boolean maintenanceMode;

    // ── Notifications ────────────────────────────────────
    private boolean trialExpiryAlertEnabled;
    private boolean newTenantSignupAlertEnabled;
    private boolean paymentFailureAlertEnabled;
    private boolean dailyDigestEnabled;
    private String  alertEmail;

    // ── Security ─────────────────────────────────────────
    private int     sessionTimeoutMinutes;
    private boolean strongPasswordsRequired;
    private boolean ipLoggingEnabled;

    // ── Billing ──────────────────────────────────────────
    private String  razorpayKeyId;
    private boolean razorpayTestMode;
    private String  currency;
    private boolean gstEnabled;

    // ── Constructor ──────────────────────────────────────
    public SuperAdminSettingsResponse() {}

    // ── Getters ──────────────────────────────────────────
    public int     getTrialDays()                   { return trialDays; }
    public int     getGraceDays()                   { return graceDays; }
    public String  getDefaultPlan()                 { return defaultPlan; }
    public String  getTimezone()                    { return timezone; }
    public boolean isAutoSuspendOnExpiry()          { return autoSuspendOnExpiry; }
    public boolean isRazorpayWebhooksEnabled()      { return razorpayWebhooksEnabled; }
    public boolean isAllowNewRegistration()         { return allowNewRegistration; }
    public boolean isMaintenanceMode()              { return maintenanceMode; }
    public boolean isTrialExpiryAlertEnabled()      { return trialExpiryAlertEnabled; }
    public boolean isNewTenantSignupAlertEnabled()  { return newTenantSignupAlertEnabled; }
    public boolean isPaymentFailureAlertEnabled()   { return paymentFailureAlertEnabled; }
    public boolean isDailyDigestEnabled()           { return dailyDigestEnabled; }
    public String  getAlertEmail()                  { return alertEmail; }
    public int     getSessionTimeoutMinutes()       { return sessionTimeoutMinutes; }
    public boolean isStrongPasswordsRequired()      { return strongPasswordsRequired; }
    public boolean isIpLoggingEnabled()             { return ipLoggingEnabled; }
    public String  getRazorpayKeyId()               { return razorpayKeyId; }
    public boolean isRazorpayTestMode()             { return razorpayTestMode; }
    public String  getCurrency()                    { return currency; }
    public boolean isGstEnabled()                   { return gstEnabled; }

    // ── Setters ──────────────────────────────────────────
    public void setTrialDays(int v)                          { this.trialDays = v; }
    public void setGraceDays(int v)                          { this.graceDays = v; }
    public void setDefaultPlan(String v)                     { this.defaultPlan = v; }
    public void setTimezone(String v)                        { this.timezone = v; }
    public void setAutoSuspendOnExpiry(boolean v)            { this.autoSuspendOnExpiry = v; }
    public void setRazorpayWebhooksEnabled(boolean v)        { this.razorpayWebhooksEnabled = v; }
    public void setAllowNewRegistration(boolean v)           { this.allowNewRegistration = v; }
    public void setMaintenanceMode(boolean v)                { this.maintenanceMode = v; }
    public void setTrialExpiryAlertEnabled(boolean v)        { this.trialExpiryAlertEnabled = v; }
    public void setNewTenantSignupAlertEnabled(boolean v)    { this.newTenantSignupAlertEnabled = v; }
    public void setPaymentFailureAlertEnabled(boolean v)     { this.paymentFailureAlertEnabled = v; }
    public void setDailyDigestEnabled(boolean v)             { this.dailyDigestEnabled = v; }
    public void setAlertEmail(String v)                      { this.alertEmail = v; }
    public void setSessionTimeoutMinutes(int v)              { this.sessionTimeoutMinutes = v; }
    public void setStrongPasswordsRequired(boolean v)        { this.strongPasswordsRequired = v; }
    public void setIpLoggingEnabled(boolean v)               { this.ipLoggingEnabled = v; }
    public void setRazorpayKeyId(String v)                   { this.razorpayKeyId = v; }
    public void setRazorpayTestMode(boolean v)               { this.razorpayTestMode = v; }
    public void setCurrency(String v)                        { this.currency = v; }
    public void setGstEnabled(boolean v)                     { this.gstEnabled = v; }
}