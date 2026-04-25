package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.NotificationResponse;
import com.restaurantpos.backend.dto.response.UnreadCountResponse;
import com.restaurantpos.backend.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<NotificationResponse> result = notificationService.findAll(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("currentPage", result.getNumber());
        response.put("pageSize", result.getSize());

        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", response));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> unreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched",
                new UnreadCountResponse(count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Marked as read",
                notificationService.markAsRead(id)));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead() {
        int updated = notificationService.markAllAsRead();
        Map<String, Integer> response = new HashMap<>();
        response.put("markedCount", updated);
        return ResponseEntity.ok(ApiResponse.success("All marked as read", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    @DeleteMapping("/read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteAllRead() {
        int deleted = notificationService.deleteAllRead();
        Map<String, Integer> response = new HashMap<>();
        response.put("deletedCount", deleted);
        return ResponseEntity.ok(ApiResponse.success("Read notifications cleared", response));
    }
}