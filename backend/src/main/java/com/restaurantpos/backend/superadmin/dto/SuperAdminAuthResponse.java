package com.restaurantpos.backend.superadmin.dto;

import java.time.LocalDateTime;

public class SuperAdminAuthResponse {

    private String token;
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private LocalDateTime lastLoginAt;

    public SuperAdminAuthResponse() {}

    public SuperAdminAuthResponse(String token, Long id, String username, String fullName, String email, LocalDateTime lastLoginAt) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.lastLoginAt = lastLoginAt;
    }

    // Getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}