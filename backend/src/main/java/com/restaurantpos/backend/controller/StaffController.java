package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.CreateStaffRequest;
import com.restaurantpos.backend.dto.request.ResetPasswordRequest;
import com.restaurantpos.backend.dto.request.UpdateRoleRequest;
import com.restaurantpos.backend.dto.request.UpdateStatusRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.StaffResponse;
import com.restaurantpos.backend.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/staff")
@PreAuthorize("hasRole('ADMIN')")   // class-level: all endpoints ADMIN-only
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaffResponse>> create(
            @Valid @RequestBody CreateStaffRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Staff created",
                staffService.createStaff(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success("Staff list fetched",
                staffService.findAllStaff()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Staff fetched",
                staffService.findStaffById(id)));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<StaffResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Role updated",
                staffService.updateRole(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                staffService.updateStatus(id, req)));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest req) {
        staffService.resetPassword(id, req);
        return ResponseEntity.ok(ApiResponse.success("Password reset", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok(ApiResponse.success("Staff deleted", null));
    }
}