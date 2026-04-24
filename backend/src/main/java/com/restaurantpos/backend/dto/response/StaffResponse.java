package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.Role;
import java.time.LocalDateTime;

public class StaffResponse {

    private Long id;
    private String username;
    private String fullName;
    private Role role;
    private Boolean active;
    private LocalDateTime createdAt;

    public StaffResponse() {}

    public StaffResponse(Long id, String username, String fullName,
                         Role role, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}