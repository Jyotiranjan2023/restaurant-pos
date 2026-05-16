package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Subscription;
import com.restaurantpos.backend.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // Find the current subscription for a tenant
    Optional<Subscription> findByTenantId(Long tenantId);

    // Check if tenant has any subscription
    boolean existsByTenantId(Long tenantId);

    // Find by status
    List<Subscription> findByStatus(SubscriptionStatus status);

    // Find trials that have expired (for daily cron)
    @Query("SELECT s FROM Subscription s WHERE s.status = :status AND s.trialEndsAt <= :now")
    List<Subscription> findExpiredTrials(
        @Param("status") SubscriptionStatus status,
        @Param("now") LocalDateTime now
    );

    // Find active subscriptions that expired (for daily cron)
    @Query("SELECT s FROM Subscription s WHERE s.status = :status AND s.expiresAt <= :now")
    List<Subscription> findExpiredActive(
        @Param("status") SubscriptionStatus status,
        @Param("now") LocalDateTime now
    );

    // Find grace periods that ended (for daily cron — to suspend)
    @Query("SELECT s FROM Subscription s WHERE s.status = :status AND s.gracePeriodEndsAt <= :now")
    List<Subscription> findExpiredGracePeriods(
        @Param("status") SubscriptionStatus status,
        @Param("now") LocalDateTime now
    );

    // Find subscriptions expiring in N days (for renewal reminders)
    @Query("SELECT s FROM Subscription s WHERE s.status = :status AND s.expiresAt BETWEEN :now AND :future")
    List<Subscription> findExpiringSoon(
        @Param("status") SubscriptionStatus status,
        @Param("now") LocalDateTime now,
        @Param("future") LocalDateTime future
    );

    // Find by Razorpay subscription ID (for webhook handling)
    Optional<Subscription> findByRazorpaySubscriptionId(String razorpaySubscriptionId);
}