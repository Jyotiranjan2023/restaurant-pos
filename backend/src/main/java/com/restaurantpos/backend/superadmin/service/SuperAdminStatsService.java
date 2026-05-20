package com.restaurantpos.backend.superadmin.service;

import com.restaurantpos.backend.enums.SubscriptionStatus;
import com.restaurantpos.backend.repository.SubscriptionRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.superadmin.dto.SuperAdminStatsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SuperAdminStatsService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    public SuperAdminStatsResponse getStats() {
        SuperAdminStatsResponse stats = new SuperAdminStatsResponse();

        stats.setTotalTenants(tenantRepository.count());

        // Active = ACTIVE + LIFETIME_FREE (both are paying/permitted)
        stats.setActiveSubscriptions(
            subscriptionRepository.countByStatusIn(
                List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.LIFETIME_FREE)
            )
        );

        stats.setTrialSubscriptions(
            subscriptionRepository.countByStatus(SubscriptionStatus.TRIAL)
        );
        stats.setGracePeriodSubscriptions(
            subscriptionRepository.countByStatus(SubscriptionStatus.GRACE_PERIOD)
        );
        stats.setSuspendedSubscriptions(
            subscriptionRepository.countByStatus(SubscriptionStatus.SUSPENDED)
        );

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        stats.setNewTenantsLast7Days(
            tenantRepository.countByCreatedAtAfter(sevenDaysAgo)
        );

        return stats;
    }
}