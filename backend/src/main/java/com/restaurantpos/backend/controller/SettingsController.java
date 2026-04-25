package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.BillSettingsRequest;
import com.restaurantpos.backend.dto.request.OrderSettingsRequest;
import com.restaurantpos.backend.dto.request.ProfileSettingsRequest;
import com.restaurantpos.backend.dto.request.TaxSettingsRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.SettingsResponse;
import com.restaurantpos.backend.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SettingsResponse>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success("Settings fetched",
                settingsService.getSettings()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingsResponse>> updateProfile(
            @Valid @RequestBody ProfileSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                settingsService.updateProfile(req)));
    }

    @PutMapping("/tax")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingsResponse>> updateTax(
            @Valid @RequestBody TaxSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Tax settings updated",
                settingsService.updateTax(req)));
    }

    @PutMapping("/bill")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingsResponse>> updateBill(
            @Valid @RequestBody BillSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Bill settings updated",
                settingsService.updateBill(req)));
    }

    @PutMapping("/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingsResponse>> updateOrder(
            @Valid @RequestBody OrderSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Order settings updated",
                settingsService.updateOrder(req)));
    }

    @PostMapping(value = "/logo", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingsResponse>> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Logo uploaded",
                settingsService.uploadLogo(file)));
    }

    @DeleteMapping("/logo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingsResponse>> removeLogo() {
        return ResponseEntity.ok(ApiResponse.success("Logo removed",
                settingsService.removeLogo()));
    }
}