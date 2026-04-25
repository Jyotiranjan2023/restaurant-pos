package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.CouponRequest;
import com.restaurantpos.backend.dto.request.CouponStatusRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.CouponResponse;
import com.restaurantpos.backend.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> create(
            @Valid @RequestBody CouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Coupon created",
                couponService.create(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success("Coupons fetched",
                couponService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Coupon fetched",
                couponService.findById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<CouponResponse>> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Coupon fetched",
                couponService.findByCode(code)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated",
                couponService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody CouponStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                couponService.updateStatus(id, req.getActive())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }
}