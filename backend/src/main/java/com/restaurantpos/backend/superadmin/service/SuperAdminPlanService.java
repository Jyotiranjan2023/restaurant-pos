package com.restaurantpos.backend.superadmin.service;

import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SuperAdminPlanService {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    /**
     * Get ALL plans (visible + hidden + inactive).
     * Sorted by displayOrder ascending so Basic appears before Pro before Enterprise.
     */
    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findAll(Sort.by("displayOrder").ascending());
    }
}