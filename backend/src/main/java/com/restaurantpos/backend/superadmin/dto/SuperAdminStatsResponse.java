package com.restaurantpos.backend.superadmin.dto;

public class SuperAdminStatsResponse {

    private Long totalTenants;
    private Long activeSubscriptions;       // ACTIVE + LIFETIME_FREE
    private Long trialSubscriptions;
    private Long gracePeriodSubscriptions;
    private Long suspendedSubscriptions;
    private Long newTenantsLast7Days;

    public SuperAdminStatsResponse() {}

    // Getters and setters
    public Long getTotalTenants() { return totalTenants; }
    public void setTotalTenants(Long totalTenants) { this.totalTenants = totalTenants; }

    public Long getActiveSubscriptions() { return activeSubscriptions; }
    public void setActiveSubscriptions(Long activeSubscriptions) { this.activeSubscriptions = activeSubscriptions; }

    public Long getTrialSubscriptions() { return trialSubscriptions; }
    public void setTrialSubscriptions(Long trialSubscriptions) { this.trialSubscriptions = trialSubscriptions; }

    public Long getGracePeriodSubscriptions() { return gracePeriodSubscriptions; }
    public void setGracePeriodSubscriptions(Long gracePeriodSubscriptions) { this.gracePeriodSubscriptions = gracePeriodSubscriptions; }

    public Long getSuspendedSubscriptions() { return suspendedSubscriptions; }
    public void setSuspendedSubscriptions(Long suspendedSubscriptions) { this.suspendedSubscriptions = suspendedSubscriptions; }

    public Long getNewTenantsLast7Days() { return newTenantsLast7Days; }
    public void setNewTenantsLast7Days(Long newTenantsLast7Days) { this.newTenantsLast7Days = newTenantsLast7Days; }
}