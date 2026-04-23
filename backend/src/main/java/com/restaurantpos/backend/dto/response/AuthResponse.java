package com.restaurantpos.backend.dto.response;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private String role;
    private Long tenantId;
    private String restaurantName;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String username, String fullName,
                        String role, Long tenantId, String restaurantName) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.tenantId = tenantId;
        this.restaurantName = restaurantName;
    }

    // Getters & Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
}