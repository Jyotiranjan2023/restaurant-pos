package com.restaurantpos.backend.controller;

import org.springframework.data.domain.Page;
import java.util.HashMap;
import java.util.Map;

import com.restaurantpos.backend.dto.request.AddItemsRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import com.restaurantpos.backend.dto.request.CreateOrderRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.KitchenItemResponse;
import com.restaurantpos.backend.dto.response.OrderResponse;
import com.restaurantpos.backend.service.KitchenService;
import com.restaurantpos.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
	private final OrderService orderService;
    private final KitchenService kitchenService;   // ADD THIS

    public OrderController(OrderService orderService, KitchenService kitchenService) {
        this.orderService = orderService;
        this.kitchenService = kitchenService;   // ADD THIS
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> create(@Valid @RequestBody CreateOrderRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Order created", orderService.createOrder(req)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order fetched", orderService.findById(id)));
    }
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Page<OrderResponse> result = orderService.findAllPaginated(page, size, sortBy, direction);

        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("currentPage", result.getNumber());
        response.put("pageSize", result.getSize());
        response.put("first", result.isFirst());
        response.put("last", result.isLast());

        return ResponseEntity.ok(ApiResponse.success("Orders fetched", response));
    }

    @GetMapping("/table/{tableId}/running")
    public ResponseEntity<ApiResponse<OrderResponse>> findRunningByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(ApiResponse.success("Running order fetched",
                orderService.findRunningOrderByTable(tableId)));
    }
    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<OrderResponse>> addItems(
            @PathVariable Long id,
            @Valid @RequestBody AddItemsRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Items added",
                orderService.addItems(id, req)));
    }

    @PatchMapping("/{id}/items/{itemId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelItem(
            @PathVariable Long id,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(ApiResponse.success("Item cancelled",
                orderService.cancelItem(id, itemId)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled",
                orderService.cancelOrder(id)));
    }

    @GetMapping("/running")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> findRunningOrders() {
        return ResponseEntity.ok(ApiResponse.success("Running orders fetched",
                orderService.findRunningOrders()));
    }
    @PatchMapping("/{orderId}/items/{itemId}/serve")
    public ResponseEntity<ApiResponse<KitchenItemResponse>> serveItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(ApiResponse.success("Item served",
                kitchenService.serveItem(orderId, itemId)));
    }
    
}