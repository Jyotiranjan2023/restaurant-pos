package com.restaurantpos.backend.controller;

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
}