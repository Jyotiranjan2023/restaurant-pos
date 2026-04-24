package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class GstReportResponse {

    private String fromDate;
    private String toDate;

    private BigDecimal totalTaxableAmount;   // subtotal
    private BigDecimal totalCgst;            // half of GST
    private BigDecimal totalSgst;            // half of GST
    private BigDecimal totalGst;             // sum of all GST
    private BigDecimal grandTotal;

    private List<GstRateBreakdown> rateBreakdowns;

    public static class GstRateBreakdown {
        private BigDecimal gstRate;            // e.g., 5%, 18%
        private BigDecimal taxableAmount;
        private BigDecimal cgst;
        private BigDecimal sgst;
        private BigDecimal total;

        public GstRateBreakdown() {}

        public GstRateBreakdown(BigDecimal gstRate, BigDecimal taxableAmount,
                                BigDecimal cgst, BigDecimal sgst, BigDecimal total) {
            this.gstRate = gstRate;
            this.taxableAmount = taxableAmount;
            this.cgst = cgst;
            this.sgst = sgst;
            this.total = total;
        }

        public BigDecimal getGstRate() { return gstRate; }
        public void setGstRate(BigDecimal gstRate) { this.gstRate = gstRate; }
        public BigDecimal getTaxableAmount() { return taxableAmount; }
        public void setTaxableAmount(BigDecimal taxableAmount) { this.taxableAmount = taxableAmount; }
        public BigDecimal getCgst() { return cgst; }
        public void setCgst(BigDecimal cgst) { this.cgst = cgst; }
        public BigDecimal getSgst() { return sgst; }
        public void setSgst(BigDecimal sgst) { this.sgst = sgst; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
    }

    // Getters & Setters
    public String getFromDate() { return fromDate; }
    public void setFromDate(String fromDate) { this.fromDate = fromDate; }

    public String getToDate() { return toDate; }
    public void setToDate(String toDate) { this.toDate = toDate; }

    public BigDecimal getTotalTaxableAmount() { return totalTaxableAmount; }
    public void setTotalTaxableAmount(BigDecimal totalTaxableAmount) { this.totalTaxableAmount = totalTaxableAmount; }

    public BigDecimal getTotalCgst() { return totalCgst; }
    public void setTotalCgst(BigDecimal totalCgst) { this.totalCgst = totalCgst; }

    public BigDecimal getTotalSgst() { return totalSgst; }
    public void setTotalSgst(BigDecimal totalSgst) { this.totalSgst = totalSgst; }

    public BigDecimal getTotalGst() { return totalGst; }
    public void setTotalGst(BigDecimal totalGst) { this.totalGst = totalGst; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }

    public List<GstRateBreakdown> getRateBreakdowns() { return rateBreakdowns; }
    public void setRateBreakdowns(List<GstRateBreakdown> rateBreakdowns) { this.rateBreakdowns = rateBreakdowns; }
}