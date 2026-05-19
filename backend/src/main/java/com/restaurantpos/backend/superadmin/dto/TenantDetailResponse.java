package com.restaurantpos.backend.superadmin.dto;

import com.restaurantpos.backend.enums.SubscriptionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TenantDetailResponse {

    // Tenant info
    private Long tenantId;
    private String restaurantName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String gstNumber;
    private String fssaiNumber;
    private Boolean active;
    private Boolean isLifetimeFree;
    private LocalDateTime createdAt;

    // Subscription info
    private Long subscriptionId;
    private String planCode;
    private String planName;
    private BigDecimal planPriceInr;
    private SubscriptionStatus subscriptionStatus;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime trialEndsAt;
    private LocalDateTime gracePeriodEndsAt;
    private Integer daysRemaining;
    private Integer currentMonthOrders;

    // Counts
    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;

    public TenantDetailResponse() {}

    // Getters and setters
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getFssaiNumber() { return fssaiNumber; }
    public void setFssaiNumber(String fssaiNumber) { this.fssaiNumber = fssaiNumber; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getIsLifetimeFree() { return isLifetimeFree; }
    public void setIsLifetimeFree(Boolean isLifetimeFree) { this.isLifetimeFree = isLifetimeFree; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(Long subscriptionId) { this.subscriptionId = subscriptionId; }

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public BigDecimal getPlanPriceInr() { return planPriceInr; }
    public void setPlanPriceInr(BigDecimal planPriceInr) { this.planPriceInr = planPriceInr; }

    public SubscriptionStatus getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(SubscriptionStatus subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getTrialEndsAt() { return trialEndsAt; }
    public void setTrialEndsAt(LocalDateTime trialEndsAt) { this.trialEndsAt = trialEndsAt; }

    public LocalDateTime getGracePeriodEndsAt() { return gracePeriodEndsAt; }
    public void setGracePeriodEndsAt(LocalDateTime gracePeriodEndsAt) { this.gracePeriodEndsAt = gracePeriodEndsAt; }

    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }

    public Integer getCurrentMonthOrders() { return currentMonthOrders; }
    public void setCurrentMonthOrders(Integer currentMonthOrders) { this.currentMonthOrders = currentMonthOrders; }

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Long totalProducts) { this.totalProducts = totalProducts; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
}