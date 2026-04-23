package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.LoginRequest;
import com.restaurantpos.backend.dto.request.RegisterRestaurantRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.AuthResponse;
import com.restaurantpos.backend.security.UserPrincipal;
import com.restaurantpos.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register-restaurant")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRestaurantRequest req) {
        AuthResponse resp = authService.registerRestaurant(req);
        return ResponseEntity.ok(ApiResponse.success("Restaurant registered successfully", resp));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success("Login successful", resp));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me(
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> data = Map.of(
            "userId",   principal.getUserId(),
            "username", principal.getUsername(),
            "role",     principal.getRole(),
            "tenantId", principal.getTenantId()
        );
        return ResponseEntity.ok(ApiResponse.success("Current user", data));
    }
}