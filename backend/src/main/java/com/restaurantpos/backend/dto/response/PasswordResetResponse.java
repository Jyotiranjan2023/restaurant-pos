package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.ResetStatus;

import java.time.LocalDateTime;

public class PasswordResetResponse {

    private Long id;
    private String username;
    private String fullName;
    private ResetStatus status;
    private String resetCode;   // ONLY populated when admin approves; null for list view
    private Integer failedAttempts;
    private LocalDateTime expiresAt;
    private LocalDateTime approvedAt;
    private String approvedByUsername;
    private LocalDateTime usedAt;
    private String deniedReason;
    private String requestIp;
    private LocalDateTime createdAt;

    public PasswordResetResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public ResetStatus getStatus() { return status; }
    public void setStatus(ResetStatus status) { this.status = status; }

    public String getResetCode() { return resetCode; }
    public void setResetCode(String resetCode) { this.resetCode = resetCode; }

    public Integer getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(Integer failedAttempts) { this.failedAttempts = failedAttempts; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getApprovedByUsername() { return approvedByUsername; }
    public void setApprovedByUsername(String approvedByUsername) { this.approvedByUsername = approvedByUsername; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    public String getDeniedReason() { return deniedReason; }
    public void setDeniedReason(String deniedReason) { this.deniedReason = deniedReason; }

    public String getRequestIp() { return requestIp; }
    public void setRequestIp(String requestIp) { this.requestIp = requestIp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}