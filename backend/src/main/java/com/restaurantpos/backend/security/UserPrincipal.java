package com.restaurantpos.backend.security;

public class UserPrincipal {
    private final Long userId;
    private final String username;
    private final String role;
    private final Long tenantId;

    public UserPrincipal(Long userId, String username, String role, Long tenantId) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.tenantId = tenantId;
    }

    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public Long getTenantId() { return tenantId; }
}