package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.PaymentMethod;
import java.math.BigDecimal;

public class PaymentMethodReportResponse {

    private PaymentMethod method;
    private Long transactionCount;
    private BigDecimal totalAmount;
    private BigDecimal percentage;   // of grand total

    public PaymentMethodReportResponse() {}

    public PaymentMethodReportResponse(PaymentMethod method, Long transactionCount,
                                       BigDecimal totalAmount, BigDecimal percentage) {
        this.method = method;
        this.transactionCount = transactionCount;
        this.totalAmount = totalAmount;
        this.percentage = percentage;
    }

    public PaymentMethod getMethod() { return method; }
    public void setMethod(PaymentMethod method) { this.method = method; }

    public Long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
}