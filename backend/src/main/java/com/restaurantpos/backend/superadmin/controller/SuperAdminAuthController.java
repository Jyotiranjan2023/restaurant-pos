package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.superadmin.dto.SuperAdminAuthRequest;
import com.restaurantpos.backend.superadmin.dto.SuperAdminAuthResponse;
import com.restaurantpos.backend.superadmin.service.SuperAdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminAuthController {

    private final SuperAdminAuthService authService;

    public SuperAdminAuthController(SuperAdminAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<SuperAdminAuthResponse>> login(
            @Valid @RequestBody SuperAdminAuthRequest request) {
        SuperAdminAuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Super admin login successful", response));
    }
}