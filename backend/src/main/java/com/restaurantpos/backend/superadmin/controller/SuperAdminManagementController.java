package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.security.UserPrincipal;
import com.restaurantpos.backend.superadmin.dto.CreateSuperAdminRequest;
import com.restaurantpos.backend.superadmin.dto.SuperAdminResponse;
import com.restaurantpos.backend.superadmin.service.SuperAdminManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin/super-admins")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminManagementController {

    private final SuperAdminManagementService managementService;

    public SuperAdminManagementController(SuperAdminManagementService managementService) {
        this.managementService = managementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SuperAdminResponse>>> listAll() {
        List<SuperAdminResponse> admins = managementService.listAllSuperAdmins();
        return ResponseEntity.ok(ApiResponse.success("Super admins fetched", admins));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SuperAdminResponse>> create(
            @Valid @RequestBody CreateSuperAdminRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        SuperAdminResponse created = managementService.createSuperAdmin(request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Super admin created", created));
    }
}