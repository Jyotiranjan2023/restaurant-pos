package com.restaurantpos.backend.dto.response;

import java.util.Map;

public class FeedbackStatsResponse {

    private Long totalFeedback;
    private Double averageRating;
    private Map<Integer, Long> ratingDistribution;   // {5: 25, 4: 12, 3: 3, ...}

    public FeedbackStatsResponse() {}

    public FeedbackStatsResponse(Long totalFeedback, Double averageRating,
                                 Map<Integer, Long> ratingDistribution) {
        this.totalFeedback = totalFeedback;
        this.averageRating = averageRating;
        this.ratingDistribution = ratingDistribution;
    }

    public Long getTotalFeedback() { return totalFeedback; }
    public void setTotalFeedback(Long totalFeedback) { this.totalFeedback = totalFeedback; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Map<Integer, Long> getRatingDistribution() { return ratingDistribution; }
    public void setRatingDistribution(Map<Integer, Long> ratingDistribution) {
        this.ratingDistribution = ratingDistribution;
    }
}