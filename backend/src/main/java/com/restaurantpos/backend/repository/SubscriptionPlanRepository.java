package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    // Find plan by code (BASIC, PRO, ENTERPRISE)
    Optional<SubscriptionPlan> findByCode(String code);

    // Find all active plans ordered by display order
    List<SubscriptionPlan> findByIsActiveTrueOrderByDisplayOrderAsc();

    // Find all visible and active plans (for tenant signup page)
    List<SubscriptionPlan> findByIsVisibleTrueAndIsActiveTrueOrderByDisplayOrderAsc();

    // Check if code already exists
    boolean existsByCode(String code);
}