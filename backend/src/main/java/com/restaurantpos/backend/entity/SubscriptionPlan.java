package com.restaurantpos.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;  // 'BASIC', 'PRO', 'ENTERPRISE'

    @Column(nullable = false, length = 100)
    private String name;  // 'Basic Plan'

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceInr;

    @Column(name = "billing_cycle_days", nullable = false)
    private Integer billingCycleDays;  // 30 for monthly

    // Feature limits (NULL = unlimited)
    @Column(name = "max_staff")
    private Integer maxStaff;

    @Column(name = "max_menu_items")
    private Integer maxMenuItems;

    @Column(name = "max_tables")
    private Integer maxTables;

    @Column(name = "max_orders_per_month")
    private Integer maxOrdersPerMonth;

    @Column(name = "max_categories")
    private Integer maxCategories;

    // Feature flags
    @Column(name = "has_inventory")
    private Boolean hasInventory = false;

    @Column(name = "has_recipes")
    private Boolean hasRecipes = false;

    @Column(name = "has_coupons")
    private Boolean hasCoupons = false;

    @Column(name = "has_kitchen_display")
    private Boolean hasKitchenDisplay = false;

    @Column(name = "has_feedback")
    private Boolean hasFeedback = false;

    @Column(name = "has_csv_export")
    private Boolean hasCsvExport = false;

    @Column(name = "has_all_reports")
    private Boolean hasAllReports = false;

    @Column(name = "has_email_notifications")
    private Boolean hasEmailNotifications = false;

    @Column(name = "has_whatsapp_notifications")
    private Boolean hasWhatsappNotifications = false;

    @Column(name = "has_custom_branding")
    private Boolean hasCustomBranding = false;

    @Column(name = "has_logo_upload")
    private Boolean hasLogoUpload = false;

    @Column(name = "has_api_access")
    private Boolean hasApiAccess = false;

    @Column(name = "has_priority_support")
    private Boolean hasPrioritySupport = false;

    // Razorpay integration
    @Column(name = "razorpay_plan_id", length = 100)
    private String razorpayPlanId;

    // Metadata
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_visible")
    private Boolean isVisible = true;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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