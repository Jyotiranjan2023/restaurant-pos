package com.restaurantpos.backend.controller;

import org.springframework.data.domain.Page;
import java.util.HashMap;
import java.util.Map;

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
    public ResponseEntity<ApiResponse<Map<String, Object>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Page<CustomerResponse> result = customerService.findAllPaginated(page, size, sortBy, direction);

        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("currentPage", result.getNumber());
        response.put("pageSize", result.getSize());
        response.put("first", result.isFirst());
        response.put("last", result.isLast());

        return ResponseEntity.ok(ApiResponse.success("Customers fetched", response));
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