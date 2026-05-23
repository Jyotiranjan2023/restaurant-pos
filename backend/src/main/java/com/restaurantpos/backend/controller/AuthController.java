package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.LoginRequest;
import com.restaurantpos.backend.dto.request.RegisterRestaurantRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.AuthResponse;
import com.restaurantpos.backend.security.UserPrincipal;
import com.restaurantpos.backend.service.AuthService;
import com.restaurantpos.backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register-restaurant")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRestaurantRequest req) {
        AuthResponse resp = authService.registerRestaurant(req);
        return ResponseEntity.ok(ApiResponse.success("Restaurant registered successfully", resp));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {
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

    /**
     * Step 1: Admin enters email → receives 6-digit code.
     * Public endpoint — no auth required.
     * Always returns success (security: don't reveal if email exists).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Email is required", null));
        }
        passwordResetService.requestReset(email.trim().toLowerCase());
        return ResponseEntity.ok(new ApiResponse<>(true,
                "If this email is registered, a 6-digit code has been sent.", null));
    }

    /**
     * Step 2: Admin submits email + 6-digit code + new password.
     * Public endpoint — no auth required.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String newPassword = body.get("newPassword");

        if (email == null || code == null || newPassword == null) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false,
                            "email, code and newPassword are required", null));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false,
                            "Password must be at least 6 characters", null));
        }

        passwordResetService.resetPassword(
                email.trim().toLowerCase(), code.trim(), newPassword);

        return ResponseEntity.ok(new ApiResponse<>(true,
                "Password reset successfully. You can now login.", null));
    }
}