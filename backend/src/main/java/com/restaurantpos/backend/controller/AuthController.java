package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.ForgotPasswordRequest;
import com.restaurantpos.backend.dto.request.ResetPasswordWithCodeRequest;
import com.restaurantpos.backend.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;

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
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService,PasswordResetService passwordResetService) { this.authService = authService;
    this.passwordResetService = passwordResetService;
    }

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
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        passwordResetService.requestReset(req, ip);
        return ResponseEntity.ok(ApiResponse.success(
                "If the username exists, a reset request has been created. Contact your administrator.",
                null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @Valid @RequestBody ResetPasswordWithCodeRequest req) {
        passwordResetService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success(
                "Password reset successfully. You can now login with your new password.", null));
    }
}