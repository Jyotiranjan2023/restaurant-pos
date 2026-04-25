package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;

public class SettingsResponse {

    // Profile
    private String restaurantName;
    private String displayName;
    private String logoUrl;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String email;
    private String website;
    private String gstNumber;
    private String fssaiNumber;
    private String currencySymbol;
    private String timezone;

    // Tax & charges
    private BigDecimal defaultGstPercent;
    private BigDecimal cgstSplitPercent;
    private BigDecimal serviceChargePercent;
    private Boolean serviceChargeAppliesDineIn;
    private Boolean serviceChargeAppliesTakeaway;
    private Boolean serviceChargeAppliesDelivery;

    // Bill
    private String printTemplate;
    private String billHeader;
    private String billFooter;
    private Boolean showGstBreakdown;
    private Boolean showTableOnBill;
    private String billNumberPrefix;

    // Order behavior
    private Boolean autoConfirmOrders;
    private Boolean allowCustomItems;
    private String defaultOrderType;

    // ===== Getters & Setters =====
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getFssaiNumber() { return fssaiNumber; }
    public void setFssaiNumber(String fssaiNumber) { this.fssaiNumber = fssaiNumber; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public BigDecimal getDefaultGstPercent() { return defaultGstPercent; }
    public void setDefaultGstPercent(BigDecimal defaultGstPercent) { this.defaultGstPercent = defaultGstPercent; }

    public BigDecimal getCgstSplitPercent() { return cgstSplitPercent; }
    public void setCgstSplitPercent(BigDecimal cgstSplitPercent) { this.cgstSplitPercent = cgstSplitPercent; }

    public BigDecimal getServiceChargePercent() { return serviceChargePercent; }
    public void setServiceChargePercent(BigDecimal serviceChargePercent) { this.serviceChargePercent = serviceChargePercent; }

    public Boolean getServiceChargeAppliesDineIn() { return serviceChargeAppliesDineIn; }
    public void setServiceChargeAppliesDineIn(Boolean serviceChargeAppliesDineIn) { this.serviceChargeAppliesDineIn = serviceChargeAppliesDineIn; }

    public Boolean getServiceChargeAppliesTakeaway() { return serviceChargeAppliesTakeaway; }
    public void setServiceChargeAppliesTakeaway(Boolean serviceChargeAppliesTakeaway) { this.serviceChargeAppliesTakeaway = serviceChargeAppliesTakeaway; }

    public Boolean getServiceChargeAppliesDelivery() { return serviceChargeAppliesDelivery; }
    public void setServiceChargeAppliesDelivery(Boolean serviceChargeAppliesDelivery) { this.serviceChargeAppliesDelivery = serviceChargeAppliesDelivery; }

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

    public Boolean getAutoConfirmOrders() { return autoConfirmOrders; }
    public void setAutoConfirmOrders(Boolean autoConfirmOrders) { this.autoConfirmOrders = autoConfirmOrders; }

    public Boolean getAllowCustomItems() { return allowCustomItems; }
    public void setAllowCustomItems(Boolean allowCustomItems) { this.allowCustomItems = allowCustomItems; }

    public String getDefaultOrderType() { return defaultOrderType; }
    public void setDefaultOrderType(String defaultOrderType) { this.defaultOrderType = defaultOrderType; }
}