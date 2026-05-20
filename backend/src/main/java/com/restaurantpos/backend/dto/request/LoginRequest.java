package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Restaurant email is required")
    @Email(message = "Must be a valid email")
    private String restaurantEmail;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {}

    public String getRestaurantEmail() { return restaurantEmail; }
    public void setRestaurantEmail(String restaurantEmail) { this.restaurantEmail = restaurantEmail; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}