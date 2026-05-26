package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.superadmin.dto.SuperAdminSettingsRequest;
import com.restaurantpos.backend.superadmin.dto.SuperAdminSettingsResponse;
import com.restaurantpos.backend.superadmin.service.SuperAdminSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/settings")
public class SuperAdminSettingsController {

    private final SuperAdminSettingsService settingsService;

    // Constructor Injection
    public SuperAdminSettingsController(SuperAdminSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    /**
     * GET /api/super-admin/settings
     * Returns all current platform settings.
     */
    @GetMapping
    public ResponseEntity<?> getSettings() {
        SuperAdminSettingsResponse settings = settingsService.getSettings();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", settings
        ));
    }

    /**
     * PUT /api/super-admin/settings
     * Updates platform settings. Only provided fields are updated.
     */
    @PutMapping
    public ResponseEntity<?> updateSettings(
            @RequestBody SuperAdminSettingsRequest request
    ) {

        SuperAdminSettingsResponse updated =
                settingsService.updateSettings(request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Settings updated successfully",
                "data", updated
        ));
    }

    /**
     * POST /api/super-admin/settings/change-password
     * Changes the currently authenticated super admin's password.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader
    ) {

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "currentPassword and newPassword are required"
            ));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Password must be at least 8 characters"
            ));
        }

        String token = authHeader.replace("Bearer ", "");

        settingsService.changePassword(
                token,
                currentPassword,
                newPassword
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password updated successfully"
        ));
    }

    /**
     * POST /api/super-admin/settings/revoke-sessions
     * Clears all active super admin sessions.
     */
    @PostMapping("/revoke-sessions")
    public ResponseEntity<?> revokeSessions() {

        settingsService.revokeAllSessions();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All sessions revoked"
        ));
    }
}