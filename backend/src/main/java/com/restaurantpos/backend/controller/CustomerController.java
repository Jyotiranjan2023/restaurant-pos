package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.CustomerRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.CustomerOrderHistoryResponse;
import com.restaurantpos.backend.dto.response.CustomerResponse;
import com.restaurantpos.backend.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerResponse>> create(
            @Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Customer created",
                customerService.create(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success("Customers fetched",
                customerService.findAll()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> search(
            @RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success("Search results",
                customerService.search(query)));
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<ApiResponse<CustomerResponse>> findByPhone(@PathVariable String phone) {
        return ResponseEntity.ok(ApiResponse.success("Customer fetched",
                customerService.findByPhone(phone)));
    }

    @GetMapping("/top-spenders")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> topSpenders() {
        return ResponseEntity.ok(ApiResponse.success("Top spenders fetched",
                customerService.getTopSpenders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Customer fetched",
                customerService.findById(id)));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<ApiResponse<List<CustomerOrderHistoryResponse>>> getOrderHistory(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order history fetched",
                customerService.getOrderHistory(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Customer updated",
                customerService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted", null));
    }
}