package com.restaurantpos.backend.superadmin.dto;

import java.util.List;

public class SuperAdminRevenueResponse {

    // ── KPI cards ──────────────────────────────────────────
    private Double totalRevenueAllTime;       // sum of all paid plan prices
    private Double revenueThisMonth;          // subscriptions active this month
    private Long   activePayingTenants;       // ACTIVE status only (not trial/lifetime)
    private Double avgRevenuePerTenant;       // totalRevenue / activePayingTenants

    // ── MRR ───────────────────────────────────────────────
    private Double currentMrr;               // sum of plan prices for all ACTIVE tenants

    // ── Monthly chart (last 6 months) ─────────────────────
    private List<MonthlyRevenue> monthlyRevenue;

    // ── Plan breakdown ────────────────────────────────────
    private List<PlanRevenue> planBreakdown;

    // ── Per-tenant revenue table ──────────────────────────
    private List<TenantRevenue> tenantRevenues;

    // ── Upcoming renewals (next 30 days) ──────────────────
    private List<UpcomingRenewal> upcomingRenewals;

    // ── Churn this month ──────────────────────────────────
    private Long cancelledThisMonth;
    private Long suspendedThisMonth;

    public SuperAdminRevenueResponse() {}

    // ── Nested DTOs ───────────────────────────────────────

    public static class MonthlyRevenue {
        private String month;        // e.g. "Jan 2025"
        private Double revenue;
        private Long   tenantCount;

        public MonthlyRevenue(String month, Double revenue, Long tenantCount) {
            this.month = month;
            this.revenue = revenue;
            this.tenantCount = tenantCount;
        }

        public String getMonth() { return month; }
        public Double getRevenue() { return revenue; }
        public Long getTenantCount() { return tenantCount; }
    }

    public static class PlanRevenue {
        private String planName;
        private String planCode;
        private Long   tenantCount;
        private Double priceInr;
        private Double totalRevenue;   // priceInr * tenantCount

        public PlanRevenue(String planName, String planCode, Long tenantCount,
                           Double priceInr, Double totalRevenue) {
            this.planName = planName;
            this.planCode = planCode;
            this.tenantCount = tenantCount;
            this.priceInr = priceInr;
            this.totalRevenue = totalRevenue;
        }

        public String getPlanName() { return planName; }
        public String getPlanCode() { return planCode; }
        public Long getTenantCount() { return tenantCount; }
        public Double getPriceInr() { return priceInr; }
        public Double getTotalRevenue() { return totalRevenue; }
    }

    public static class TenantRevenue {
        private Long   tenantId;
        private String restaurantName;
        private String email;
        private String planName;
        private String status;
        private Double monthlyRevenue;
        private String expiresAt;
        private Integer daysRemaining;

        public TenantRevenue(Long tenantId, String restaurantName, String email,
                             String planName, String status, Double monthlyRevenue,
                             String expiresAt, Integer daysRemaining) {
            this.tenantId = tenantId;
            this.restaurantName = restaurantName;
            this.email = email;
            this.planName = planName;
            this.status = status;
            this.monthlyRevenue = monthlyRevenue;
            this.expiresAt = expiresAt;
            this.daysRemaining = daysRemaining;
        }

        public Long getTenantId() { return tenantId; }
        public String getRestaurantName() { return restaurantName; }
        public String getEmail() { return email; }
        public String getPlanName() { return planName; }
        public String getStatus() { return status; }
        public Double getMonthlyRevenue() { return monthlyRevenue; }
        public String getExpiresAt() { return expiresAt; }
        public Integer getDaysRemaining() { return daysRemaining; }
    }

    public static class UpcomingRenewal {
        private Long   tenantId;
        private String restaurantName;
        private String email;
        private String planName;
        private Double amount;
        private String expiresAt;
        private Integer daysUntilRenewal;

        public UpcomingRenewal(Long tenantId, String restaurantName, String email,
                               String planName, Double amount, String expiresAt,
                               Integer daysUntilRenewal) {
            this.tenantId = tenantId;
            this.restaurantName = restaurantName;
            this.email = email;
            this.planName = planName;
            this.amount = amount;
            this.expiresAt = expiresAt;
            this.daysUntilRenewal = daysUntilRenewal;
        }

        public Long getTenantId() { return tenantId; }
        public String getRestaurantName() { return restaurantName; }
        public String getEmail() { return email; }
        public String getPlanName() { return planName; }
        public Double getAmount() { return amount; }
        public String getExpiresAt() { return expiresAt; }
        public Integer getDaysUntilRenewal() { return daysUntilRenewal; }
    }

    // ── Getters & Setters ─────────────────────────────────

    public Double getTotalRevenueAllTime() { return totalRevenueAllTime; }
    public void setTotalRevenueAllTime(Double v) { this.totalRevenueAllTime = v; }

    public Double getRevenueThisMonth() { return revenueThisMonth; }
    public void setRevenueThisMonth(Double v) { this.revenueThisMonth = v; }

    public Long getActivePayingTenants() { return activePayingTenants; }
    public void setActivePayingTenants(Long v) { this.activePayingTenants = v; }

    public Double getAvgRevenuePerTenant() { return avgRevenuePerTenant; }
    public void setAvgRevenuePerTenant(Double v) { this.avgRevenuePerTenant = v; }

    public Double getCurrentMrr() { return currentMrr; }
    public void setCurrentMrr(Double v) { this.currentMrr = v; }

    public List<MonthlyRevenue> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<MonthlyRevenue> v) { this.monthlyRevenue = v; }

    public List<PlanRevenue> getPlanBreakdown() { return planBreakdown; }
    public void setPlanBreakdown(List<PlanRevenue> v) { this.planBreakdown = v; }

    public List<TenantRevenue> getTenantRevenues() { return tenantRevenues; }
    public void setTenantRevenues(List<TenantRevenue> v) { this.tenantRevenues = v; }

    public List<UpcomingRenewal> getUpcomingRenewals() { return upcomingRenewals; }
    public void setUpcomingRenewals(List<UpcomingRenewal> v) { this.upcomingRenewals = v; }

    public Long getCancelledThisMonth() { return cancelledThisMonth; }
    public void setCancelledThisMonth(Long v) { this.cancelledThisMonth = v; }

    public Long getSuspendedThisMonth() { return suspendedThisMonth; }
    public void setSuspendedThisMonth(Long v) { this.suspendedThisMonth = v; }
}