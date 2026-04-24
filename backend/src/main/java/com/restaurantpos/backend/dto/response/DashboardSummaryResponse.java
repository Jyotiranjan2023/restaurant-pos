package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryResponse {

    // Today's snapshot
    private Long todayOrderCount;
    private BigDecimal todayRevenue;
    private Long runningOrderCount;
    private Long lowStockCount;
    private Long activeStaffCount;

    // Breakdowns (today)
    private Map<String, BigDecimal> revenueByOrderType;   // e.g. {DINE_IN: 500, TAKEAWAY: 200}
    private Map<String, BigDecimal> revenueByPaymentMethod;

    // Top sellers (today)
    private List<TopProduct> topSellingProducts;

    // Last 7 days trend (for chart)
    private List<DailyRevenue> last7DaysRevenue;

    // ===== Inner DTOs =====

    public static class TopProduct {
        private Long productId;
        private String productName;
        private Long quantitySold;
        private BigDecimal revenue;

        public TopProduct() {}

        public TopProduct(Long productId, String productName, Long quantitySold, BigDecimal revenue) {
            this.productId = productId;
            this.productName = productName;
            this.quantitySold = quantitySold;
            this.revenue = revenue;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Long getQuantitySold() { return quantitySold; }
        public void setQuantitySold(Long quantitySold) { this.quantitySold = quantitySold; }

        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }

    public static class DailyRevenue {
        private String date;          // "2026-04-24"
        private BigDecimal revenue;
        private Long orderCount;

        public DailyRevenue() {}

        public DailyRevenue(String date, BigDecimal revenue, Long orderCount) {
            this.date = date;
            this.revenue = revenue;
            this.orderCount = orderCount;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

        public Long getOrderCount() { return orderCount; }
        public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }
    }

    // ===== Main getters/setters =====
    public Long getTodayOrderCount() { return todayOrderCount; }
    public void setTodayOrderCount(Long todayOrderCount) { this.todayOrderCount = todayOrderCount; }

    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }

    public Long getRunningOrderCount() { return runningOrderCount; }
    public void setRunningOrderCount(Long runningOrderCount) { this.runningOrderCount = runningOrderCount; }

    public Long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(Long lowStockCount) { this.lowStockCount = lowStockCount; }

    public Long getActiveStaffCount() { return activeStaffCount; }
    public void setActiveStaffCount(Long activeStaffCount) { this.activeStaffCount = activeStaffCount; }

    public Map<String, BigDecimal> getRevenueByOrderType() { return revenueByOrderType; }
    public void setRevenueByOrderType(Map<String, BigDecimal> revenueByOrderType) {
        this.revenueByOrderType = revenueByOrderType;
    }

    public Map<String, BigDecimal> getRevenueByPaymentMethod() { return revenueByPaymentMethod; }
    public void setRevenueByPaymentMethod(Map<String, BigDecimal> revenueByPaymentMethod) {
        this.revenueByPaymentMethod = revenueByPaymentMethod;
    }

    public List<TopProduct> getTopSellingProducts() { return topSellingProducts; }
    public void setTopSellingProducts(List<TopProduct> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }

    public List<DailyRevenue> getLast7DaysRevenue() { return last7DaysRevenue; }
    public void setLast7DaysRevenue(List<DailyRevenue> last7DaysRevenue) {
        this.last7DaysRevenue = last7DaysRevenue;
    }
}