package com.restaurantpos.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String restaurantName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String address;
    private String gstNumber;       // e.g., 21ABCDE1234F1Z5
    private String fssaiNumber;     // Food license

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean active = true;
    
 // ===== NEW: Profile fields =====
    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "display_name")
    private String displayName;   // optional override of restaurantName for bills

    private String city;
    private String state;
    private String pincode;
    private String website;

    @Column(name = "currency_symbol", length = 5)
    private String currencySymbol = "₹";

    @Column(length = 50)
    private String timezone = "Asia/Kolkata";

    // ===== NEW: Tax settings =====
    @Column(name = "default_gst_percent", precision = 5, scale = 2)
    private java.math.BigDecimal defaultGstPercent = new java.math.BigDecimal("5.00");

    @Column(name = "cgst_split_percent", precision = 5, scale = 2)
    private java.math.BigDecimal cgstSplitPercent = new java.math.BigDecimal("50.00");
    // 50 means CGST=50% of GST, SGST=50% of GST

    @Column(name = "service_charge_percent", precision = 5, scale = 2)
    private java.math.BigDecimal serviceChargePercent = java.math.BigDecimal.ZERO;

    @Column(name = "service_charge_applies_dine_in")
    private Boolean serviceChargeAppliesDineIn = false;

    @Column(name = "service_charge_applies_takeaway")
    private Boolean serviceChargeAppliesTakeaway = false;

    @Column(name = "service_charge_applies_delivery")
    private Boolean serviceChargeAppliesDelivery = false;

    // ===== NEW: Bill settings =====
    @Column(name = "print_template", length = 20)
    private String printTemplate = "THERMAL_80";   // THERMAL_58, THERMAL_80, A4

    @Column(name = "bill_header", columnDefinition = "TEXT")
    private String billHeader;

    @Column(name = "bill_footer", columnDefinition = "TEXT")
    private String billFooter = "Thank you! Visit again.";

    @Column(name = "show_gst_breakdown")
    private Boolean showGstBreakdown = true;

    @Column(name = "show_table_on_bill")
    private Boolean showTableOnBill = true;

    @Column(name = "bill_number_prefix", length = 10)
    private String billNumberPrefix = "BILL";

    // ===== NEW: Order settings =====
    @Column(name = "auto_confirm_orders")
    private Boolean autoConfirmOrders = false;

    @Column(name = "allow_custom_items")
    private Boolean allowCustomItems = true;

    @Column(name = "default_order_type", length = 20)
    private String defaultOrderType = "DINE_IN";


    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getFssaiNumber() { return fssaiNumber; }
    public void setFssaiNumber(String fssaiNumber) { this.fssaiNumber = fssaiNumber; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public java.math.BigDecimal getDefaultGstPercent() { return defaultGstPercent; }
    public void setDefaultGstPercent(java.math.BigDecimal defaultGstPercent) { this.defaultGstPercent = defaultGstPercent; }

    public java.math.BigDecimal getCgstSplitPercent() { return cgstSplitPercent; }
    public void setCgstSplitPercent(java.math.BigDecimal cgstSplitPercent) { this.cgstSplitPercent = cgstSplitPercent; }

    public java.math.BigDecimal getServiceChargePercent() { return serviceChargePercent; }
    public void setServiceChargePercent(java.math.BigDecimal serviceChargePercent) { this.serviceChargePercent = serviceChargePercent; }

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