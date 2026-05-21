package com.restaurantpos.backend.superadmin.dto;

import java.time.LocalDateTime;

public class AuditLogResponse {

    private Long id;
    private Long superAdminId;
    private String superAdminUsername;     // resolved via lookup
    private String action;
    private Long targetTenantId;
    private String targetTenantName;       // resolved via lookup
    private Long targetSubscriptionId;
    private String previousValue;
    private String newValue;
    private String reason;
    private LocalDateTime createdAt;

    public AuditLogResponse() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSuperAdminId() { return superAdminId; }
    public void setSuperAdminId(Long superAdminId) { this.superAdminId = superAdminId; }

    public String getSuperAdminUsername() { return superAdminUsername; }
    public void setSuperAdminUsername(String superAdminUsername) { this.superAdminUsername = superAdminUsername; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getTargetTenantId() { return targetTenantId; }
    public void setTargetTenantId(Long targetTenantId) { this.targetTenantId = targetTenantId; }

    public String getTargetTenantName() { return targetTenantName; }
    public void setTargetTenantName(String targetTenantName) { this.targetTenantName = targetTenantName; }

    public Long getTargetSubscriptionId() { return targetSubscriptionId; }
    public void setTargetSubscriptionId(Long targetSubscriptionId) { this.targetSubscriptionId = targetSubscriptionId; }

    public String getPreviousValue() { return previousValue; }
    public void setPreviousValue(String previousValue) { this.previousValue = previousValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}