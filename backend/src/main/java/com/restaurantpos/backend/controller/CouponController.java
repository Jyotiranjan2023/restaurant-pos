package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.annotation.RequiresFeature;
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

    @RequiresFeature("has_coupons")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> create(
            @Valid @RequestBody CouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Coupon created",
                couponService.create(req)));
    }

    @RequiresFeature("has_coupons")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success("Coupons fetched",
                couponService.findAll()));
    }

    @RequiresFeature("has_coupons")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Coupon fetched",
                couponService.findById(id)));
    }

    @RequiresFeature("has_coupons")
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<CouponResponse>> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Coupon fetched",
                couponService.findByCode(code)));
    }

    @RequiresFeature("has_coupons")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated",
                couponService.update(id, req)));
    }

    @RequiresFeature("has_coupons")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody CouponStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                couponService.updateStatus(id, req.getActive())));
    }

    @RequiresFeature("has_coupons")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }
}