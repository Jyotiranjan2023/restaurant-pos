package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.annotation.RequiresFeature;
import com.restaurantpos.backend.dto.request.FeedbackRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.FeedbackResponse;
import com.restaurantpos.backend.dto.response.FeedbackStatsResponse;
import com.restaurantpos.backend.dto.response.ProductRatingResponse;
import com.restaurantpos.backend.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // ✅ NO GATE — customer/staff can always submit feedback (BASIC plan too)
    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submit(
            @Valid @RequestBody FeedbackRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted",
                feedbackService.submit(req)));
    }

    // 🔒 GATED — viewing all feedback is a paid feature
    @RequiresFeature("has_feedback")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<FeedbackResponse> result = feedbackService.findAll(page, size);
        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("currentPage", result.getNumber());
        response.put("pageSize", result.getSize());
        return ResponseEntity.ok(ApiResponse.success("Feedback list fetched", response));
    }

    // 🔒 GATED — viewing individual feedback is a paid feature
    @RequiresFeature("has_feedback")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback fetched",
                feedbackService.findById(id)));
    }

    // ✅ NO GATE — checking feedback for a specific bill (used by customer-side flow)
    @GetMapping("/bill/{billId}")
    public ResponseEntity<ApiResponse<FeedbackResponse>> findByBillId(@PathVariable Long billId) {
        return ResponseEntity.ok(ApiResponse.success("Feedback fetched",
                feedbackService.findByBillId(billId)));
    }

    // 🔒 GATED — feedback analytics is a paid feature
    @RequiresFeature("has_feedback")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Feedback stats fetched",
                feedbackService.getStats()));
    }

    // ✅ NO GATE — product rating is shown to customers on menu
    @GetMapping("/products/{productId}/rating")
    public ResponseEntity<ApiResponse<ProductRatingResponse>> getProductRating(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Product rating fetched",
                feedbackService.getProductRating(productId)));
    }

    // 🔒 GATED — deleting feedback requires the paid feature
    @RequiresFeature("has_feedback")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        feedbackService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted", null));
    }
}