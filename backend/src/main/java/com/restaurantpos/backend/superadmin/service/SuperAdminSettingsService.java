package com.restaurantpos.backend.superadmin.service;

import com.restaurantpos.backend.superadmin.dto.SuperAdminSettingsRequest;
import com.restaurantpos.backend.superadmin.dto.SuperAdminSettingsResponse;
import com.restaurantpos.backend.superadmin.entity.SuperAdmin;
import com.restaurantpos.backend.superadmin.repository.SuperAdminRepository;
import com.restaurantpos.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SuperAdminSettingsService {

    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtUtil              jwtUtil;

    // ── Manual constructor (no Lombok) ───────────────────
    public SuperAdminSettingsService(
            SuperAdminRepository superAdminRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.superAdminRepository = superAdminRepository;
        this.passwordEncoder      = passwordEncoder;
        this.jwtUtil              = jwtUtil;
    }

    // ── General ──────────────────────────────────────────
    @Value("${app.settings.trial-days:7}")
    private int trialDays;

    @Value("${app.settings.grace-days:3}")
    private int graceDays;

    @Value("${app.settings.default-plan:ENTERPRISE}")
    private String defaultPlan;

    @Value("${app.settings.timezone:Asia/Kolkata}")
    private String timezone;

    // ── Feature flags ────────────────────────────────────
    @Value("${app.settings.auto-suspend:true}")
    private boolean autoSuspendOnExpiry;

    @Value("${app.settings.razorpay-webhooks:true}")
    private boolean razorpayWebhooksEnabled;

    @Value("${app.settings.allow-registration:true}")
    private boolean allowNewRegistration;

    @Value("${app.settings.maintenance-mode:false}")
    private boolean maintenanceMode;

    // ── Notifications ────────────────────────────────────
    @Value("${app.settings.alert.trial-expiry:true}")
    private boolean trialExpiryAlertEnabled;

    @Value("${app.settings.alert.new-tenant:true}")
    private boolean newTenantSignupAlertEnabled;

    @Value("${app.settings.alert.payment-failure:true}")
    private boolean paymentFailureAlertEnabled;

    @Value("${app.settings.alert.daily-digest:false}")
    private boolean dailyDigestEnabled;

    @Value("${app.settings.alert.email:admin@yourpos.com}")
    private String alertEmail;

    // ── Security ─────────────────────────────────────────
    @Value("${app.settings.session-timeout-minutes:30}")
    private int sessionTimeoutMinutes;

    @Value("${app.settings.strong-passwords:true}")
    private boolean strongPasswordsRequired;

    @Value("${app.settings.ip-logging:true}")
    private boolean ipLoggingEnabled;

    // ── Billing ──────────────────────────────────────────
    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.test-mode:false}")
    private boolean razorpayTestMode;

    @Value("${app.settings.currency:INR}")
    private String currency;

    @Value("${app.settings.gst-enabled:true}")
    private boolean gstEnabled;

    // ─────────────────────────────────────────────────────

    public SuperAdminSettingsResponse getSettings() {
        return buildResponse();
    }

    public SuperAdminSettingsResponse updateSettings(SuperAdminSettingsRequest req) {
        if (req.getTrialDays()                   != null) trialDays                   = req.getTrialDays();
        if (req.getGraceDays()                   != null) graceDays                   = req.getGraceDays();
        if (req.getDefaultPlan()                 != null) defaultPlan                 = req.getDefaultPlan();
        if (req.getTimezone()                    != null) timezone                    = req.getTimezone();
        if (req.getAutoSuspendOnExpiry()         != null) autoSuspendOnExpiry         = req.getAutoSuspendOnExpiry();
        if (req.getRazorpayWebhooksEnabled()     != null) razorpayWebhooksEnabled     = req.getRazorpayWebhooksEnabled();
        if (req.getAllowNewRegistration()         != null) allowNewRegistration        = req.getAllowNewRegistration();
        if (req.getMaintenanceMode()             != null) maintenanceMode             = req.getMaintenanceMode();
        if (req.getTrialExpiryAlertEnabled()     != null) trialExpiryAlertEnabled     = req.getTrialExpiryAlertEnabled();
        if (req.getNewTenantSignupAlertEnabled() != null) newTenantSignupAlertEnabled = req.getNewTenantSignupAlertEnabled();
        if (req.getPaymentFailureAlertEnabled()  != null) paymentFailureAlertEnabled  = req.getPaymentFailureAlertEnabled();
        if (req.getDailyDigestEnabled()          != null) dailyDigestEnabled          = req.getDailyDigestEnabled();
        if (req.getAlertEmail()                  != null) alertEmail                  = req.getAlertEmail();
        if (req.getSessionTimeoutMinutes()       != null) sessionTimeoutMinutes       = req.getSessionTimeoutMinutes();
        if (req.getStrongPasswordsRequired()     != null) strongPasswordsRequired     = req.getStrongPasswordsRequired();
        if (req.getIpLoggingEnabled()            != null) ipLoggingEnabled            = req.getIpLoggingEnabled();
        if (req.getRazorpayKeyId()               != null) razorpayKeyId               = req.getRazorpayKeyId();
        if (req.getRazorpayTestMode()            != null) razorpayTestMode            = req.getRazorpayTestMode();
        if (req.getCurrency()                    != null) currency                    = req.getCurrency();
        if (req.getGstEnabled()                  != null) gstEnabled                  = req.getGstEnabled();

        return buildResponse();
    }

    public void changePassword(String token, String currentPassword, String newPassword) {
    	String username = jwtUtil.getUsername(token);

        SuperAdmin admin = superAdminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Super admin not found"));

        if (!passwordEncoder.matches(currentPassword, admin.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        superAdminRepository.save(admin);
    }

    public void revokeAllSessions() {
        // Placeholder — extend with token blacklist if needed
    }

    // ── Private helpers ──────────────────────────────────
    private SuperAdminSettingsResponse buildResponse() {
        SuperAdminSettingsResponse r = new SuperAdminSettingsResponse();
        r.setTrialDays(trialDays);
        r.setGraceDays(graceDays);
        r.setDefaultPlan(defaultPlan);
        r.setTimezone(timezone);
        r.setAutoSuspendOnExpiry(autoSuspendOnExpiry);
        r.setRazorpayWebhooksEnabled(razorpayWebhooksEnabled);
        r.setAllowNewRegistration(allowNewRegistration);
        r.setMaintenanceMode(maintenanceMode);
        r.setTrialExpiryAlertEnabled(trialExpiryAlertEnabled);
        r.setNewTenantSignupAlertEnabled(newTenantSignupAlertEnabled);
        r.setPaymentFailureAlertEnabled(paymentFailureAlertEnabled);
        r.setDailyDigestEnabled(dailyDigestEnabled);
        r.setAlertEmail(alertEmail);
        r.setSessionTimeoutMinutes(sessionTimeoutMinutes);
        r.setStrongPasswordsRequired(strongPasswordsRequired);
        r.setIpLoggingEnabled(ipLoggingEnabled);
        r.setRazorpayKeyId(razorpayKeyId);
        r.setRazorpayTestMode(razorpayTestMode);
        r.setCurrency(currency);
        r.setGstEnabled(gstEnabled);
        return r;
    }
}