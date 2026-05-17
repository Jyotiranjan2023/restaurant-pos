package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.SubscriptionStatus;
import java.time.LocalDateTime;

public class SubscriptionResponse {

    private Long id;
    private Long tenantId;
    private Long planId;
    private String planCode;       // e.g., "ENTERPRISE"
    private String planName;       // e.g., "Enterprise"
    
    private SubscriptionStatus status;
    
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime trialEndsAt;
    private LocalDateTime gracePeriodEndsAt;
    private LocalDateTime cancelledAt;
    private String cancelReason;
    
    // Razorpay (mostly null for trial/lifetime)
    private String razorpaySubscriptionId;
    private String razorpayCustomerId;
    
    // Usage counter
    private Integer currentMonthOrders;
    
    // Computed helpers (calculated by service)
    private Integer daysRemaining;        // Days until expires_at
    private Boolean isActive;
    private Boolean canCreateOrders;
    private String displayStatus;         // Friendly text for UI

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getTrialEndsAt() { return trialEndsAt; }
    public void setTrialEndsAt(LocalDateTime trialEndsAt) { this.trialEndsAt = trialEndsAt; }

    public LocalDateTime getGracePeriodEndsAt() { return gracePeriodEndsAt; }
    public void setGracePeriodEndsAt(LocalDateTime gracePeriodEndsAt) { this.gracePeriodEndsAt = gracePeriodEndsAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public String getRazorpaySubscriptionId() { return razorpaySubscriptionId; }
    public void setRazorpaySubscriptionId(String razorpaySubscriptionId) { this.razorpaySubscriptionId = razorpaySubscriptionId; }

    public String getRazorpayCustomerId() { return razorpayCustomerId; }
    public void setRazorpayCustomerId(String razorpayCustomerId) { this.razorpayCustomerId = razorpayCustomerId; }

    public Integer getCurrentMonthOrders() { return currentMonthOrders; }
    public void setCurrentMonthOrders(Integer currentMonthOrders) { this.currentMonthOrders = currentMonthOrders; }

    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getCanCreateOrders() { return canCreateOrders; }
    public void setCanCreateOrders(Boolean canCreateOrders) { this.canCreateOrders = canCreateOrders; }

    public String getDisplayStatus() { return displayStatus; }
    public void setDisplayStatus(String displayStatus) { this.displayStatus = displayStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}