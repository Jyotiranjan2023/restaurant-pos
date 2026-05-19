package com.restaurantpos.backend.superadmin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "super_admin_actions")
public class SuperAdminAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "super_admin_id", nullable = false)
    private Long superAdminId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "target_tenant_id")
    private Long targetTenantId;

    @Column(name = "target_subscription_id")
    private Long targetSubscriptionId;

    @Column(name = "previous_value")
    private String previousValue;

    @Column(name = "new_value")
    private String newValue;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public SuperAdminAction() {}

    public SuperAdminAction(Long superAdminId, String action, Long targetTenantId,
                            Long targetSubscriptionId, String previousValue,
                            String newValue, String reason) {
        this.superAdminId = superAdminId;
        this.action = action;
        this.targetTenantId = targetTenantId;
        this.targetSubscriptionId = targetSubscriptionId;
        this.previousValue = previousValue;
        this.newValue = newValue;
        this.reason = reason;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSuperAdminId() { return superAdminId; }
    public void setSuperAdminId(Long superAdminId) { this.superAdminId = superAdminId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getTargetTenantId() { return targetTenantId; }
    public void setTargetTenantId(Long targetTenantId) { this.targetTenantId = targetTenantId; }

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