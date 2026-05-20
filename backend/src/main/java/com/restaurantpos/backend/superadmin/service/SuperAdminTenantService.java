package com.restaurantpos.backend.superadmin.service;
import com.restaurantpos.backend.superadmin.dto.ConvertLifetimeRequest;

import com.restaurantpos.backend.entity.Subscription;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.enums.SubscriptionStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.ProductRepository;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import com.restaurantpos.backend.repository.SubscriptionRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.superadmin.dto.TenantDetailResponse;
import com.restaurantpos.backend.superadmin.dto.TenantSummaryResponse;
import com.restaurantpos.backend.superadmin.entity.SuperAdminAction;
import com.restaurantpos.backend.superadmin.repository.SuperAdminActionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@Transactional
public class SuperAdminTenantService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SuperAdminActionRepository actionRepository;

    // ========== READ ==========

    /**
     * List all tenants paginated, newest first.
     */
    @Transactional(readOnly = true)
    public Page<TenantSummaryResponse> listAllTenants(int page, int size, String search, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Step 1: Search filter (name/email) at DB level
        Page<Tenant> tenants;
        if (search != null && !search.trim().isEmpty()) {
            tenants = tenantRepository.searchByName(search.trim(), pageable);
        } else {
            tenants = tenantRepository.findAll(pageable);
        }

        // Step 2: Convert to DTOs (this fetches subscription info)
        Page<TenantSummaryResponse> dtoPage = tenants.map(this::toSummary);

        // Step 3: Status filter (post-fetch, since status is on Subscription not Tenant)
        // Note: this filters the current page. For 1000s of tenants you'd want
        // to push status filter to a JOIN query.
        if (status != null && !status.trim().isEmpty()) {
            java.util.List<TenantSummaryResponse> filtered = dtoPage.getContent().stream()
                .filter(t -> status.equalsIgnoreCase(
                    t.getSubscriptionStatus() != null ? t.getSubscriptionStatus().toString() : null
                ))
                .collect(java.util.stream.Collectors.toList());
            return new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
        }

        return dtoPage;
    }
    /**
     * Get full detail of a single tenant.
     */
    @Transactional(readOnly = true)
    public TenantDetailResponse getTenantDetail(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tenant not found with id: " + tenantId));

        TenantDetailResponse dto = new TenantDetailResponse();

        dto.setTenantId(tenant.getId());
        dto.setRestaurantName(tenant.getRestaurantName());
        dto.setEmail(tenant.getEmail());
        dto.setPhone(tenant.getPhone());
        dto.setAddress(tenant.getAddress());
        dto.setCity(tenant.getCity());
        dto.setState(tenant.getState());
        dto.setPincode(tenant.getPincode());
        dto.setGstNumber(tenant.getGstNumber());
        dto.setFssaiNumber(tenant.getFssaiNumber());
        dto.setActive(tenant.getActive());
        dto.setIsLifetimeFree(tenant.getIsLifetimeFree());
        dto.setCreatedAt(tenant.getCreatedAt());

        if (tenant.getCurrentSubscriptionId() != null) {
            subscriptionRepository.findById(tenant.getCurrentSubscriptionId())
                    .ifPresent(sub -> {
                        dto.setSubscriptionId(sub.getId());
                        dto.setSubscriptionStatus(sub.getStatus());
                        dto.setStartedAt(sub.getStartedAt());
                        dto.setExpiresAt(sub.getExpiresAt());
                        dto.setTrialEndsAt(sub.getTrialEndsAt());
                        dto.setGracePeriodEndsAt(sub.getGracePeriodEndsAt());
                        dto.setDaysRemaining(calculateDaysRemaining(sub));
                        dto.setCurrentMonthOrders(sub.getCurrentMonthOrders());

                        planRepository.findById(sub.getPlanId()).ifPresent(plan -> {
                            dto.setPlanCode(plan.getCode());
                            dto.setPlanName(plan.getName());
                            dto.setPlanPriceInr(plan.getPriceInr());
                        });
                    });
        }

        dto.setTotalUsers(userRepository.countByTenantId(tenantId));
        dto.setTotalProducts(productRepository.countByTenantId(tenantId));
        dto.setTotalOrders(orderRepository.countByTenantId(tenantId));

        return dto;
    }

    // ========== WRITE ==========

    /**
     * Suspend a tenant's subscription manually.
     * Records the action in audit log.
     */
    public TenantDetailResponse suspendTenant(Long tenantId, String reason, Long superAdminId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tenant not found with id: " + tenantId));

        if (tenant.getCurrentSubscriptionId() == null) {
            throw new BadRequestException("Tenant has no subscription to suspend");
        }

        Subscription sub = subscriptionRepository.findById(tenant.getCurrentSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Subscription not found for tenant: " + tenantId));

        if (sub.getStatus() == SubscriptionStatus.SUSPENDED) {
            throw new BadRequestException("Subscription is already suspended");
        }

        SubscriptionStatus previousStatus = sub.getStatus();

        sub.setStatus(SubscriptionStatus.SUSPENDED);
        subscriptionRepository.save(sub);

        // If lifetime free, clear the flag so UI is consistent
        if (Boolean.TRUE.equals(tenant.getIsLifetimeFree())) {
            tenant.setIsLifetimeFree(false);
            tenantRepository.save(tenant);
        }

        SuperAdminAction action = new SuperAdminAction(
                superAdminId,
                "SUSPEND_TENANT",
                tenantId,
                sub.getId(),
                previousStatus.toString(),
                SubscriptionStatus.SUSPENDED.toString(),
                reason
        );
        actionRepository.save(action);

        return getTenantDetail(tenantId);
    }

    /**
     * Reactivate a suspended/cancelled tenant.
     * Restores subscription to ACTIVE status with fresh expiry.
     */
    public TenantDetailResponse reactivateTenant(Long tenantId, String reason,
                                                  Integer extendDays, Long superAdminId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tenant not found with id: " + tenantId));

        if (tenant.getCurrentSubscriptionId() == null) {
            throw new BadRequestException("Tenant has no subscription to reactivate");
        }

        Subscription sub = subscriptionRepository.findById(tenant.getCurrentSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Subscription not found for tenant: " + tenantId));

        if (sub.getStatus() == SubscriptionStatus.ACTIVE) {
            throw new BadRequestException("Subscription is already active");
        }
        if (sub.getStatus() == SubscriptionStatus.LIFETIME_FREE) {
            throw new BadRequestException("Subscription is lifetime free, cannot reactivate");
        }

        SubscriptionStatus previousStatus = sub.getStatus();

        int days = (extendDays != null && extendDays > 0) ? extendDays : 30;
        LocalDateTime now = LocalDateTime.now();

        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setExpiresAt(now.plusDays(days));
        sub.setGracePeriodEndsAt(null);
        subscriptionRepository.save(sub);

        SuperAdminAction action = new SuperAdminAction(
                superAdminId,
                "REACTIVATE_TENANT",
                tenantId,
                sub.getId(),
                previousStatus.toString(),
                SubscriptionStatus.ACTIVE.toString() + " (" + days + " days)",
                reason
        );
        actionRepository.save(action);

        return getTenantDetail(tenantId);
    }
    
    /**
     * Convert a tenant to LIFETIME_FREE on the ENTERPRISE plan.
     * Forces ENTERPRISE plan for full feature access.
     * Sets far-future expiry date (year 2100) to match existing lifetime tenants.
     */
    public TenantDetailResponse convertToLifetimeFree(Long tenantId, String reason, Long superAdminId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tenant not found with id: " + tenantId));

        // Check if already lifetime
        if (Boolean.TRUE.equals(tenant.getIsLifetimeFree())) {
            throw new BadRequestException("Tenant is already lifetime free");
        }

        if (tenant.getCurrentSubscriptionId() == null) {
            throw new BadRequestException("Tenant has no subscription to convert");
        }

        Subscription sub = subscriptionRepository.findById(tenant.getCurrentSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Subscription not found for tenant: " + tenantId));

        // Get ENTERPRISE plan
        var enterprisePlan = planRepository.findByCode("ENTERPRISE")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ENTERPRISE plan not found"));

        SubscriptionStatus previousStatus = sub.getStatus();
        Long previousPlanId = sub.getPlanId();

        // Apply lifetime conversion
        sub.setStatus(SubscriptionStatus.LIFETIME_FREE);
        sub.setPlanId(enterprisePlan.getId());
        sub.setExpiresAt(LocalDateTime.of(2100, 1, 1, 0, 0));
        sub.setGracePeriodEndsAt(null);
        sub.setTrialEndsAt(null);
        subscriptionRepository.save(sub);

        // Set tenant flag
        tenant.setIsLifetimeFree(true);
        tenantRepository.save(tenant);

        // Record audit log
        String previousValue = previousStatus.toString() + " (plan id " + previousPlanId + ")";
        String newValue = "LIFETIME_FREE (plan ENTERPRISE)";

        SuperAdminAction action = new SuperAdminAction(
                superAdminId,
                "CONVERT_LIFETIME_FREE",
                tenantId,
                sub.getId(),
                previousValue,
                newValue,
                reason
        );
        actionRepository.save(action);

        return getTenantDetail(tenantId);
    }

    // ========== HELPER ==========

    private TenantSummaryResponse toSummary(Tenant tenant) {
        TenantSummaryResponse dto = new TenantSummaryResponse();
        dto.setTenantId(tenant.getId());
        dto.setRestaurantName(tenant.getRestaurantName());
        dto.setEmail(tenant.getEmail());
        dto.setPhone(tenant.getPhone());
        dto.setCity(tenant.getCity());
        dto.setState(tenant.getState());
        dto.setActive(tenant.getActive());
        dto.setIsLifetimeFree(tenant.getIsLifetimeFree());
        dto.setCreatedAt(tenant.getCreatedAt());

        if (tenant.getCurrentSubscriptionId() != null) {
            subscriptionRepository.findById(tenant.getCurrentSubscriptionId())
                    .ifPresent(sub -> {
                        dto.setSubscriptionId(sub.getId());
                        dto.setSubscriptionStatus(sub.getStatus());
                        dto.setExpiresAt(sub.getExpiresAt());
                        dto.setDaysRemaining(calculateDaysRemaining(sub));

                        planRepository.findById(sub.getPlanId()).ifPresent(plan -> {
                            dto.setPlanCode(plan.getCode());
                            dto.setPlanName(plan.getName());
                        });
                    });
        }

        return dto;
    }

    private Integer calculateDaysRemaining(Subscription sub) {
        if (sub.getStatus() == SubscriptionStatus.LIFETIME_FREE) return null;

        LocalDateTime relevant = sub.getExpiresAt();
        if (sub.getStatus() == SubscriptionStatus.TRIAL && sub.getTrialEndsAt() != null) {
            relevant = sub.getTrialEndsAt();
        } else if (sub.getStatus() == SubscriptionStatus.GRACE_PERIOD && sub.getGracePeriodEndsAt() != null) {
            relevant = sub.getGracePeriodEndsAt();
        }

        if (relevant == null) return 0;
        LocalDateTime now = LocalDateTime.now();
        if (!relevant.isAfter(now)) return 0;

        long totalSeconds = ChronoUnit.SECONDS.between(now, relevant);
        return (int) ((totalSeconds + 86399) / 86400);
    }
}