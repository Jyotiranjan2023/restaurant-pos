package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.security.UserPrincipal;
import com.restaurantpos.backend.superadmin.dto.ConvertLifetimeRequest;
import com.restaurantpos.backend.superadmin.dto.ReactivateTenantRequest;
import com.restaurantpos.backend.superadmin.dto.SuspendTenantRequest;
import com.restaurantpos.backend.superadmin.dto.TenantDetailResponse;
import com.restaurantpos.backend.superadmin.dto.TenantSummaryResponse;
import com.restaurantpos.backend.superadmin.service.SuperAdminTenantService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/tenants")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminTenantController {

    private final SuperAdminTenantService tenantService;

    public SuperAdminTenantController(SuperAdminTenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listTenants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<TenantSummaryResponse> result = tenantService.listAllTenants(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("currentPage", result.getNumber());
        response.put("pageSize", result.getSize());

        return ResponseEntity.ok(ApiResponse.success("Tenants fetched", response));
    }

    @GetMapping("/{tenantId}")
    public ResponseEntity<ApiResponse<TenantDetailResponse>> getTenantDetail(
            @PathVariable Long tenantId) {
        TenantDetailResponse detail = tenantService.getTenantDetail(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Tenant detail fetched", detail));
    }

    @PostMapping("/{tenantId}/suspend")
    public ResponseEntity<ApiResponse<TenantDetailResponse>> suspendTenant(
            @PathVariable Long tenantId,
            @RequestBody(required = false) SuspendTenantRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String reason = (request != null) ? request.getReason() : null;
        TenantDetailResponse result = tenantService.suspendTenant(
                tenantId, reason, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Tenant suspended", result));
    }

    @PostMapping("/{tenantId}/reactivate")
    public ResponseEntity<ApiResponse<TenantDetailResponse>> reactivateTenant(
            @PathVariable Long tenantId,
            @RequestBody(required = false) ReactivateTenantRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String reason = (request != null) ? request.getReason() : null;
        Integer extendDays = (request != null) ? request.getExtendDays() : null;

        TenantDetailResponse result = tenantService.reactivateTenant(
                tenantId, reason, extendDays, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Tenant reactivated", result));
    }

    @PostMapping("/{tenantId}/convert-lifetime")
    public ResponseEntity<ApiResponse<TenantDetailResponse>> convertToLifetimeFree(
            @PathVariable Long tenantId,
            @RequestBody(required = false) ConvertLifetimeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String reason = (request != null) ? request.getReason() : null;
        TenantDetailResponse result = tenantService.convertToLifetimeFree(
                tenantId, reason, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Tenant converted to lifetime free", result));
    }
}