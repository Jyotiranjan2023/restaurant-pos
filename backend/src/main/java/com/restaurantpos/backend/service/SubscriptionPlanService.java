package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.CreatePlanRequest;
import com.restaurantpos.backend.dto.request.UpdatePlanRequest;
import com.restaurantpos.backend.dto.response.PlanResponse;
import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubscriptionPlanService {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    // ========== READ OPERATIONS ==========

    /**
     * Get all plans (for super admin — includes inactive ones)
     */
    @Transactional(readOnly = true)
    public List<PlanResponse> getAllPlans() {
        return planRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active plans (for general use)
     */
    @Transactional(readOnly = true)
    public List<PlanResponse> getActivePlans() {
        return planRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all visible + active plans (for tenant signup page)
     */
    @Transactional(readOnly = true)
    public List<PlanResponse> getVisiblePlans() {
        return planRepository.findByIsVisibleTrueAndIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get single plan by ID
     */
    @Transactional(readOnly = true)
    public PlanResponse getPlanById(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
        return toResponse(plan);
    }

    /**
     * Get plan by code (e.g., "BASIC", "PRO")
     */
    @Transactional(readOnly = true)
    public PlanResponse getPlanByCode(String code) {
        SubscriptionPlan plan = planRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Plan not found with code: " + code));
        return toResponse(plan);
    }

    // ========== WRITE OPERATIONS ==========

    /**
     * Create a new plan (super admin only)
     */
    public PlanResponse createPlan(CreatePlanRequest request) {
        // Auto-uppercase code
        String code = request.getCode().toUpperCase();

        // Check duplicate
        if (planRepository.existsByCode(code)) {
            throw new RuntimeException("Plan with code '" + code + "' already exists");
        }

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setCode(code);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setPriceInr(request.getPriceInr());
        plan.setBillingCycleDays(request.getBillingCycleDays());

        // Limits
        plan.setMaxStaff(request.getMaxStaff());
        plan.setMaxMenuItems(request.getMaxMenuItems());
        plan.setMaxTables(request.getMaxTables());
        plan.setMaxOrdersPerMonth(request.getMaxOrdersPerMonth());
        plan.setMaxCategories(request.getMaxCategories());

        // Features
        plan.setHasInventory(request.getHasInventory() != null ? request.getHasInventory() : false);
        plan.setHasRecipes(request.getHasRecipes() != null ? request.getHasRecipes() : false);
        plan.setHasCoupons(request.getHasCoupons() != null ? request.getHasCoupons() : false);
        plan.setHasKitchenDisplay(request.getHasKitchenDisplay() != null ? request.getHasKitchenDisplay() : false);
        plan.setHasFeedback(request.getHasFeedback() != null ? request.getHasFeedback() : false);
        plan.setHasCsvExport(request.getHasCsvExport() != null ? request.getHasCsvExport() : false);
        plan.setHasAllReports(request.getHasAllReports() != null ? request.getHasAllReports() : false);
        plan.setHasEmailNotifications(request.getHasEmailNotifications() != null ? request.getHasEmailNotifications() : false);
        plan.setHasWhatsappNotifications(request.getHasWhatsappNotifications() != null ? request.getHasWhatsappNotifications() : false);
        plan.setHasCustomBranding(request.getHasCustomBranding() != null ? request.getHasCustomBranding() : false);
        plan.setHasLogoUpload(request.getHasLogoUpload() != null ? request.getHasLogoUpload() : false);
        plan.setHasApiAccess(request.getHasApiAccess() != null ? request.getHasApiAccess() : false);
        plan.setHasPrioritySupport(request.getHasPrioritySupport() != null ? request.getHasPrioritySupport() : false);

        // Metadata
        plan.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        plan.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);
        plan.setIsActive(true);

        SubscriptionPlan saved = planRepository.save(plan);
        return toResponse(saved);
    }

    /**
     * Update existing plan (super admin only)
     * Note: Cannot change code — codes are permanent identifiers
     */
    public PlanResponse updatePlan(Long id, UpdatePlanRequest request) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setPriceInr(request.getPriceInr());
        plan.setBillingCycleDays(request.getBillingCycleDays());

        // Limits (can set to null = unlimited)
        plan.setMaxStaff(request.getMaxStaff());
        plan.setMaxMenuItems(request.getMaxMenuItems());
        plan.setMaxTables(request.getMaxTables());
        plan.setMaxOrdersPerMonth(request.getMaxOrdersPerMonth());
        plan.setMaxCategories(request.getMaxCategories());

        // Features — only update if non-null in request
        if (request.getHasInventory() != null) plan.setHasInventory(request.getHasInventory());
        if (request.getHasRecipes() != null) plan.setHasRecipes(request.getHasRecipes());
        if (request.getHasCoupons() != null) plan.setHasCoupons(request.getHasCoupons());
        if (request.getHasKitchenDisplay() != null) plan.setHasKitchenDisplay(request.getHasKitchenDisplay());
        if (request.getHasFeedback() != null) plan.setHasFeedback(request.getHasFeedback());
        if (request.getHasCsvExport() != null) plan.setHasCsvExport(request.getHasCsvExport());
        if (request.getHasAllReports() != null) plan.setHasAllReports(request.getHasAllReports());
        if (request.getHasEmailNotifications() != null) plan.setHasEmailNotifications(request.getHasEmailNotifications());
        if (request.getHasWhatsappNotifications() != null) plan.setHasWhatsappNotifications(request.getHasWhatsappNotifications());
        if (request.getHasCustomBranding() != null) plan.setHasCustomBranding(request.getHasCustomBranding());
        if (request.getHasLogoUpload() != null) plan.setHasLogoUpload(request.getHasLogoUpload());
        if (request.getHasApiAccess() != null) plan.setHasApiAccess(request.getHasApiAccess());
        if (request.getHasPrioritySupport() != null) plan.setHasPrioritySupport(request.getHasPrioritySupport());

        // Metadata
        if (request.getDisplayOrder() != null) plan.setDisplayOrder(request.getDisplayOrder());
        if (request.getIsVisible() != null) plan.setIsVisible(request.getIsVisible());
        if (request.getIsActive() != null) plan.setIsActive(request.getIsActive());

        SubscriptionPlan updated = planRepository.save(plan);
        return toResponse(updated);
    }

    /**
     * Soft delete — mark plan as inactive
     * Doesn't actually delete the row (existing subscriptions still reference it)
     */
    public void deactivatePlan(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));

        plan.setIsActive(false);
        plan.setIsVisible(false);
        planRepository.save(plan);
    }

    /**
     * Toggle visibility (hide/show from signup page)
     */
    public PlanResponse toggleVisibility(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));

        plan.setIsVisible(!plan.getIsVisible());
        SubscriptionPlan updated = planRepository.save(plan);
        return toResponse(updated);
    }

    // ========== HELPER METHODS ==========

    /**
     * Convert entity to response DTO
     */
    private PlanResponse toResponse(SubscriptionPlan plan) {
        PlanResponse response = new PlanResponse();
        response.setId(plan.getId());
        response.setCode(plan.getCode());
        response.setName(plan.getName());
        response.setDescription(plan.getDescription());
        response.setPriceInr(plan.getPriceInr());
        response.setBillingCycleDays(plan.getBillingCycleDays());

        // Limits
        response.setMaxStaff(plan.getMaxStaff());
        response.setMaxMenuItems(plan.getMaxMenuItems());
        response.setMaxTables(plan.getMaxTables());
        response.setMaxOrdersPerMonth(plan.getMaxOrdersPerMonth());
        response.setMaxCategories(plan.getMaxCategories());

        // Features
        response.setHasInventory(plan.getHasInventory());
        response.setHasRecipes(plan.getHasRecipes());
        response.setHasCoupons(plan.getHasCoupons());
        response.setHasKitchenDisplay(plan.getHasKitchenDisplay());
        response.setHasFeedback(plan.getHasFeedback());
        response.setHasCsvExport(plan.getHasCsvExport());
        response.setHasAllReports(plan.getHasAllReports());
        response.setHasEmailNotifications(plan.getHasEmailNotifications());
        response.setHasWhatsappNotifications(plan.getHasWhatsappNotifications());
        response.setHasCustomBranding(plan.getHasCustomBranding());
        response.setHasLogoUpload(plan.getHasLogoUpload());
        response.setHasApiAccess(plan.getHasApiAccess());
        response.setHasPrioritySupport(plan.getHasPrioritySupport());

        // Razorpay
        response.setRazorpayPlanId(plan.getRazorpayPlanId());

        // Metadata
        response.setDisplayOrder(plan.getDisplayOrder());
        response.setIsVisible(plan.getIsVisible());
        response.setIsActive(plan.getIsActive());
        response.setCreatedAt(plan.getCreatedAt());
        response.setUpdatedAt(plan.getUpdatedAt());

        return response;
    }
}