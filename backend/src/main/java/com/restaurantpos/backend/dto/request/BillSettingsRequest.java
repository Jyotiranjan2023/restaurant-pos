package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.Pattern;

public class BillSettingsRequest {

    @Pattern(regexp = "THERMAL_58|THERMAL_80|A4", message = "Invalid template. Use THERMAL_58, THERMAL_80 or A4")
    private String printTemplate;

    private String billHeader;
    private String billFooter;
    private Boolean showGstBreakdown;
    private Boolean showTableOnBill;
    private String billNumberPrefix;

    public String getPrintTemplate() { return printTemplate; }
    public void setPrintTemplate(String printTemplate) { this.printTemplate = printTemplate; }

    public String getBillHeader() { return billHeader; }
    public void setBillHeader(String billHeader) { this.billHeader = billHeader; }

    public String getBillFooter() { return billFooter; }
    public void setBillFooter(String billFooter) { this.billFooter = billFooter; }

    public Boolean getShowGstBreakdown() { return showGstBreakdown; }
    public void setShowGstBreakdown(Boolean showGstBreakdown) { this.showGstBreakdown = showGstBreakdown; }

    public Boolean getShowTableOnBill() { return showTableOnBill; }
    public void setShowTableOnBill(Boolean showTableOnBill) { this.showTableOnBill = showTableOnBill; }

    public String getBillNumberPrefix() { return billNumberPrefix; }
    public void setBillNumberPrefix(String billNumberPrefix) { this.billNumberPrefix = billNumberPrefix; }
}