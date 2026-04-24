package com.restaurantpos.backend.controller;

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

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesReportResponse>> getSalesReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Sales report fetched",
                reportService.getSalesReport(from, to)));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductReportResponse>>> getProductReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Product report fetched",
                reportService.getProductReport(from, to)));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffReportResponse>>> getStaffReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Staff report fetched",
                reportService.getStaffReport(from, to)));
    }

    @GetMapping("/gst")
    public ResponseEntity<ApiResponse<GstReportResponse>> getGstReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("GST report fetched",
                reportService.getGstReport(from, to)));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<ApiResponse<List<PaymentMethodReportResponse>>> getPaymentMethodReport(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success("Payment method report fetched",
                reportService.getPaymentMethodReport(from, to)));
    }
}