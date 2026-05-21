package com.restaurantpos.backend.superadmin.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.superadmin.dto.AuditLogResponse;
import com.restaurantpos.backend.superadmin.service.SuperAdminAuditService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/audit-log")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminAuditController {

    private final SuperAdminAuditService auditService;

    public SuperAdminAuditController(SuperAdminAuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAuditLog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AuditLogResponse> result = auditService.getAuditLog(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("currentPage", result.getNumber());
        response.put("pageSize", result.getSize());

        return ResponseEntity.ok(ApiResponse.success("Audit log fetched", response));
    }
}