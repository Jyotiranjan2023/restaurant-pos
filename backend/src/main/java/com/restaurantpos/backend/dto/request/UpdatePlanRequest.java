package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class UpdatePlanRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be max 100 characters")
    private String name;

    @Size(max = 1000, message = "Description must be max 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price cannot be negative")
    @DecimalMax(value = "99999.99", message = "Price too high")
    private BigDecimal priceInr;

    @NotNull(message = "Billing cycle days is required")
    @Min(value = 1, message = "Billing cycle must be at least 1 day")
    @Max(value = 365, message = "Billing cycle cannot exceed 365 days")
    private Integer billingCycleDays;

    // Limits
    @Min(value = 1)
    private Integer maxStaff;

    @Min(value = 1)
    private Integer maxMenuItems;

    @Min(value = 1)
    private Integer maxTables;

    @Min(value = 1)
    private Integer maxOrdersPerMonth;

    @Min(value = 1)
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

    // Metadata
    @Min(value = 0)
    private Integer displayOrder;

    private Boolean isVisible;
    private Boolean isActive;

    // Getters and Setters
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

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}