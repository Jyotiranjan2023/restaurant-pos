package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.AddPaymentRequest;
import com.restaurantpos.backend.dto.request.CancelBillRequest;
import com.restaurantpos.backend.dto.response.PrintableBillResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;

import com.restaurantpos.backend.dto.request.ApplyDiscountRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.BillResponse;
import com.restaurantpos.backend.service.BillService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/generate/{orderId}")
    public ResponseEntity<ApiResponse<BillResponse>> generate(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Bill generated",
                billService.generateBill(orderId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Bill fetched",
                billService.findById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success("Bills fetched",
                billService.findAll()));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<BillResponse>> findByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Bill fetched",
                billService.findByOrderId(orderId)));
    }

    @PatchMapping("/{id}/discount")
    public ResponseEntity<ApiResponse<BillResponse>> applyDiscount(
            @PathVariable Long id,
            @Valid @RequestBody ApplyDiscountRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Discount applied",
                billService.applyDiscount(id, req)));
    }
    
    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<BillResponse>> addPayment(
            @PathVariable Long id,
            @Valid @RequestBody AddPaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Payment added",
                billService.addPayment(id, req)));
    }

    @PostMapping("/{id}/settle")
    public ResponseEntity<ApiResponse<BillResponse>> settle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Bill settled",
                billService.settleBillById(id)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BillResponse>> cancel(
            @PathVariable Long id,
            @Valid @RequestBody CancelBillRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Bill cancelled",
                billService.cancelBill(id, req)));
    }

    @GetMapping("/{id}/print")
    public ResponseEntity<ApiResponse<PrintableBillResponse>> getPrintableBill(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Printable bill fetched",
                billService.getPrintableBill(id)));
    }

    @GetMapping(value = "/{id}/print-html", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getPrintableBillHtml(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getPrintableBillHtml(id));
    }
    @DeleteMapping("/{id}/payments/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BillResponse>> removePayment(
            @PathVariable Long id,
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(ApiResponse.success("Payment removed",
                billService.removePayment(id, paymentId)));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getTodaysBills() {
        return ResponseEntity.ok(ApiResponse.success("Today's bills fetched",
                billService.findTodaysBills()));
    }
}