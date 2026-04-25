package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.ChangePasswordRequest;
import com.restaurantpos.backend.dto.request.UpdateProfileRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.MyProfileResponse;
import com.restaurantpos.backend.service.MeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final MeService meService;

    public MeController(MeService meService) {
        this.meService = meService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<MyProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched",
                meService.getMyProfile()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<MyProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                meService.updateProfile(req)));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Object>> changePassword(
            @Valid @RequestBody ChangePasswordRequest req) {
        meService.changePassword(req);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}