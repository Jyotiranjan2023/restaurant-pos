package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;

public class ProductReportResponse {

    private Long productId;
    private String productName;
    private String categoryName;
    private Long quantitySold;
    private BigDecimal revenue;
    private BigDecimal avgPrice;

    public ProductReportResponse() {}

    public ProductReportResponse(Long productId, String productName, String categoryName,
                                 Long quantitySold, BigDecimal revenue, BigDecimal avgPrice) {
        this.productId = productId;
        this.productName = productName;
        this.categoryName = categoryName;
        this.quantitySold = quantitySold;
        this.revenue = revenue;
        this.avgPrice = avgPrice;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getQuantitySold() { return quantitySold; }
    public void setQuantitySold(Long quantitySold) { this.quantitySold = quantitySold; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public BigDecimal getAvgPrice() { return avgPrice; }
    public void setAvgPrice(BigDecimal avgPrice) { this.avgPrice = avgPrice; }
}