package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class SalesReportResponse {

    private String fromDate;
    private String toDate;

    // Totals for the range
    private Long totalOrders;
    private Long totalBills;
    private BigDecimal totalRevenue;
    private BigDecimal totalSubtotal;
    private BigDecimal totalGst;
    private BigDecimal totalDiscount;
    private Long totalItemsSold;

    // Averages
    private BigDecimal avgOrderValue;

    // Day-by-day breakdown for charts
    private List<DailySales> dailySales;

    public static class DailySales {
        private String date;
        private Long orderCount;
        private BigDecimal revenue;
        private BigDecimal gst;
        private BigDecimal discount;

        public DailySales() {}

        public DailySales(String date, Long orderCount, BigDecimal revenue,
                          BigDecimal gst, BigDecimal discount) {
            this.date = date;
            this.orderCount = orderCount;
            this.revenue = revenue;
            this.gst = gst;
            this.discount = discount;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Long getOrderCount() { return orderCount; }
        public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        public BigDecimal getGst() { return gst; }
        public void setGst(BigDecimal gst) { this.gst = gst; }
        public BigDecimal getDiscount() { return discount; }
        public void setDiscount(BigDecimal discount) { this.discount = discount; }
    }

    // Getters & Setters
    public String getFromDate() { return fromDate; }
    public void setFromDate(String fromDate) { this.fromDate = fromDate; }

    public String getToDate() { return toDate; }
    public void setToDate(String toDate) { this.toDate = toDate; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public Long getTotalBills() { return totalBills; }
    public void setTotalBills(Long totalBills) { this.totalBills = totalBills; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getTotalSubtotal() { return totalSubtotal; }
    public void setTotalSubtotal(BigDecimal totalSubtotal) { this.totalSubtotal = totalSubtotal; }

    public BigDecimal getTotalGst() { return totalGst; }
    public void setTotalGst(BigDecimal totalGst) { this.totalGst = totalGst; }

    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(BigDecimal totalDiscount) { this.totalDiscount = totalDiscount; }

    public Long getTotalItemsSold() { return totalItemsSold; }
    public void setTotalItemsSold(Long totalItemsSold) { this.totalItemsSold = totalItemsSold; }

    public BigDecimal getAvgOrderValue() { return avgOrderValue; }
    public void setAvgOrderValue(BigDecimal avgOrderValue) { this.avgOrderValue = avgOrderValue; }

    public List<DailySales> getDailySales() { return dailySales; }
    public void setDailySales(List<DailySales> dailySales) { this.dailySales = dailySales; }
}