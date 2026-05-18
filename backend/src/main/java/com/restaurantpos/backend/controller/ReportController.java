package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.annotation.RequiresFeature;
import com.restaurantpos.backend.dto.response.*;
import com.restaurantpos.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ✅ NOT GATED — basic sales report available on all plans
    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesReportResponse>> getSalesReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Sales report fetched",
                reportService.getSalesReport(from, to)));
    }

    // 🔒 GATED — advanced product analytics
    @RequiresFeature("has_all_reports")
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductReportResponse>>> getProductReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Product report fetched",
                reportService.getProductReport(from, to)));
    }

    // 🔒 GATED — staff performance is a premium feature
    @RequiresFeature("has_all_reports")
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffReportResponse>>> getStaffReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Staff report fetched",
                reportService.getStaffReport(from, to)));
    }

    // ✅ NOT GATED — GST is compliance, available on all plans (consistent with /export/gst)
    @GetMapping("/gst")
    public ResponseEntity<ApiResponse<GstReportResponse>> getGstReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("GST report fetched",
                reportService.getGstReport(from, to)));
    }

    // 🔒 GATED — payment method breakdown is a premium analytics feature
    @RequiresFeature("has_all_reports")
    @GetMapping("/payment-methods")
    public ResponseEntity<ApiResponse<List<PaymentMethodReportResponse>>> getPaymentMethodReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Payment method report fetched",
                reportService.getPaymentMethodReport(from, to)));
    }
}