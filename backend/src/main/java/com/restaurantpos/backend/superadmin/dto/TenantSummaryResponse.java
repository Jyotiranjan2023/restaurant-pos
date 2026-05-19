package com.restaurantpos.backend.superadmin.dto;

import com.restaurantpos.backend.enums.SubscriptionStatus;

import java.time.LocalDateTime;

public class TenantSummaryResponse {

    private Long tenantId;
    private String restaurantName;
    private String email;
    private String phone;
    private String city;
    private String state;
    private Boolean active;
    private Boolean isLifetimeFree;
    private LocalDateTime createdAt;

    // Subscription info (may be null if tenant has no subscription)
    private Long subscriptionId;
    private String planCode;
    private String planName;
    private SubscriptionStatus subscriptionStatus;
    private Integer daysRemaining;
    private LocalDateTime expiresAt;

    public TenantSummaryResponse() {}

    // Getters and setters
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getIsLifetimeFree() { return isLifetimeFree; }
    public void setIsLifetimeFree(Boolean isLifetimeFree) { this.isLifetimeFree = isLifetimeFree; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(Long subscriptionId) { this.subscriptionId = subscriptionId; }

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public SubscriptionStatus getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(SubscriptionStatus subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }

    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}