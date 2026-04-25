package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.DenyResetRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.PasswordResetResponse;
import com.restaurantpos.backend.enums.ResetStatus;
import com.restaurantpos.backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/password-resets")
@PreAuthorize("hasRole('ADMIN')")
public class PasswordResetAdminController {

    private final PasswordResetService resetService;

    public PasswordResetAdminController(PasswordResetService resetService) {
        this.resetService = resetService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PasswordResetResponse>>> findAll(
            @RequestParam(required = false) ResetStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Reset requests fetched",
                resetService.findAll(status)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PasswordResetResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Request approved. Communicate the reset code to the user.",
                resetService.approve(id)));
    }

    @PostMapping("/{id}/deny")
    public ResponseEntity<ApiResponse<PasswordResetResponse>> deny(
            @PathVariable Long id,
            @RequestBody(required = false) DenyResetRequest req) {
        DenyResetRequest body = req != null ? req : new DenyResetRequest();
        return ResponseEntity.ok(ApiResponse.success("Request denied",
                resetService.deny(id, body)));
    }
}