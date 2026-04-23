package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    @NotBlank @Email
    private String email;

    private String phone;
    private String address;

    @NotBlank @Size(min = 3, max = 30)
    private String adminUsername;

    @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
    private String adminPassword;

    @NotBlank
    private String adminFullName;

    // Getters & Setters
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAdminUsername() { return adminUsername; }
    public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }
    public String getAdminPassword() { return adminPassword; }
    public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }
    public String getAdminFullName() { return adminFullName; }
    public void setAdminFullName(String adminFullName) { this.adminFullName = adminFullName; }
}