package com.restaurantpos.backend.dto.response;

public class ProductRatingResponse {

    private Long productId;
    private String productName;
    private Double averageRating;
    private Long feedbackCount;

    public ProductRatingResponse() {}

    public ProductRatingResponse(Long productId, String productName,
                                 Double averageRating, Long feedbackCount) {
        this.productId = productId;
        this.productName = productName;
        this.averageRating = averageRating;
        this.feedbackCount = feedbackCount;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Long getFeedbackCount() { return feedbackCount; }
    public void setFeedbackCount(Long feedbackCount) { this.feedbackCount = feedbackCount; }
}