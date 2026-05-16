package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PlanResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal priceInr;
    private Integer billingCycleDays;

    // Limits
    private Integer maxStaff;
    private Integer maxMenuItems;
    private Integer maxTables;
    private Integer maxOrdersPerMonth;
    private Integer maxCategories;

    // Features
    private Boolean hasInventory;
    private Boolean hasRecipes;
    private Boolean hasCoupons;
    private Boolean hasKitchenDisplay;
    private Boolean hasFeedback;
    private Boolean hasCsvExport;
    private Boolean hasAllReports;
    private Boolean hasEmailNotifications;
    private Boolean hasWhatsappNotifications;
    private Boolean hasCustomBranding;
    private Boolean hasLogoUpload;
    private Boolean hasApiAccess;
    private Boolean hasPrioritySupport;

    // Razorpay
    private String razorpayPlanId;

    // Metadata
    private Integer displayOrder;
    private Boolean isVisible;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPriceInr() { return priceInr; }
    public void setPriceInr(BigDecimal priceInr) { this.priceInr = priceInr; }

    public Integer getBillingCycleDays() { return billingCycleDays; }
    public void setBillingCycleDays(Integer billingCycleDays) { this.billingCycleDays = billingCycleDays; }

    public Integer getMaxStaff() { return maxStaff; }
    public void setMaxStaff(Integer maxStaff) { this.maxStaff = maxStaff; }

    public Integer getMaxMenuItems() { return maxMenuItems; }
    public void setMaxMenuItems(Integer maxMenuItems) { this.maxMenuItems = maxMenuItems; }

    public Integer getMaxTables() { return maxTables; }
    public void setMaxTables(Integer maxTables) { this.maxTables = maxTables; }

    public Integer getMaxOrdersPerMonth() { return maxOrdersPerMonth; }
    public void setMaxOrdersPerMonth(Integer maxOrdersPerMonth) { this.maxOrdersPerMonth = maxOrdersPerMonth; }

    public Integer getMaxCategories() { return maxCategories; }
    public void setMaxCategories(Integer maxCategories) { this.maxCategories = maxCategories; }

    public Boolean getHasInventory() { return hasInventory; }
    public void setHasInventory(Boolean hasInventory) { this.hasInventory = hasInventory; }

    public Boolean getHasRecipes() { return hasRecipes; }
    public void setHasRecipes(Boolean hasRecipes) { this.hasRecipes = hasRecipes; }

    public Boolean getHasCoupons() { return hasCoupons; }
    public void setHasCoupons(Boolean hasCoupons) { this.hasCoupons = hasCoupons; }

    public Boolean getHasKitchenDisplay() { return hasKitchenDisplay; }
    public void setHasKitchenDisplay(Boolean hasKitchenDisplay) { this.hasKitchenDisplay = hasKitchenDisplay; }

    public Boolean getHasFeedback() { return hasFeedback; }
    public void setHasFeedback(Boolean hasFeedback) { this.hasFeedback = hasFeedback; }

    public Boolean getHasCsvExport() { return hasCsvExport; }
    public void setHasCsvExport(Boolean hasCsvExport) { this.hasCsvExport = hasCsvExport; }

    public Boolean getHasAllReports() { return hasAllReports; }
    public void setHasAllReports(Boolean hasAllReports) { this.hasAllReports = hasAllReports; }

    public Boolean getHasEmailNotifications() { return hasEmailNotifications; }
    public void setHasEmailNotifications(Boolean hasEmailNotifications) { this.hasEmailNotifications = hasEmailNotifications; }

    public Boolean getHasWhatsappNotifications() { return hasWhatsappNotifications; }
    public void setHasWhatsappNotifications(Boolean hasWhatsappNotifications) { this.hasWhatsappNotifications = hasWhatsappNotifications; }

    public Boolean getHasCustomBranding() { return hasCustomBranding; }
    public void setHasCustomBranding(Boolean hasCustomBranding) { this.hasCustomBranding = hasCustomBranding; }

    public Boolean getHasLogoUpload() { return hasLogoUpload; }
    public void setHasLogoUpload(Boolean hasLogoUpload) { this.hasLogoUpload = hasLogoUpload; }

    public Boolean getHasApiAccess() { return hasApiAccess; }
    public void setHasApiAccess(Boolean hasApiAccess) { this.hasApiAccess = hasApiAccess; }

    public Boolean getHasPrioritySupport() { return hasPrioritySupport; }
    public void setHasPrioritySupport(Boolean hasPrioritySupport) { this.hasPrioritySupport = hasPrioritySupport; }

    public String getRazorpayPlanId() { return razorpayPlanId; }
    public void setRazorpayPlanId(String razorpayPlanId) { this.razorpayPlanId = razorpayPlanId; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}