package com.restaurantpos.backend.scheduler;

import com.restaurantpos.backend.service.SubscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for subscription lifecycle management.
 * 
 * Runs daily at 2 AM to:
 *  - Expire trials → grace period
 *  - Expire active subscriptions (failed renewal) → grace period
 *  - Suspend expired grace periods
 * 
 * Runs on 1st of each month at 3 AM to:
 *  - Reset monthly order counters
 */
@Component
public class SubscriptionMaintenanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionMaintenanceScheduler.class);

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * Daily maintenance — runs every day at 2:00 AM server time.
     * 
     * Cron format: "second minute hour day-of-month month day-of-week"
     * "0 0 2 * * *" = at second 0, minute 0, hour 2, any day, any month, any weekday
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void runDailyMaintenance() {
        log.info("=== Starting daily subscription maintenance ===");
        
        try {
            int expiredTrials = subscriptionService.processExpiredTrials();
            log.info("Expired trials moved to grace period: {}", expiredTrials);
        } catch (Exception e) {
            log.error("Failed to process expired trials", e);
        }

        try {
            int expiredActive = subscriptionService.processExpiredActiveSubscriptions();
            log.info("Expired active subscriptions moved to grace period: {}", expiredActive);
        } catch (Exception e) {
            log.error("Failed to process expired active subscriptions", e);
        }

        try {
            int expiredGrace = subscriptionService.processExpiredGracePeriods();
            log.info("Expired grace periods suspended: {}", expiredGrace);
        } catch (Exception e) {
            log.error("Failed to process expired grace periods", e);
        }

        log.info("=== Daily subscription maintenance complete ===");
    }

    /**
     * Monthly counter reset — runs on 1st of each month at 3:00 AM.
     * 
     * "0 0 3 1 * *" = second 0, minute 0, hour 3, day 1, any month, any weekday
     */
    @Scheduled(cron = "0 0 3 1 * *")
    public void runMonthlyMaintenance() {
        log.info("=== Starting monthly subscription counter reset ===");
        
        try {
            int reset = subscriptionService.resetMonthlyOrderCounters();
            log.info("Monthly order counters reset: {} subscriptions", reset);
        } catch (Exception e) {
            log.error("Failed to reset monthly counters", e);
        }
        
        log.info("=== Monthly counter reset complete ===");
    }

    /**
     * TEMPORARY: Quick test method — runs every 60 seconds.
     * 
     * USED FOR TESTING ONLY. We'll comment this out after testing works.
     * Without this, you'd have to wait until 2 AM to see the scheduler run.
     */
    @Scheduled(fixedDelay = 60000)  // every 60 seconds
    public void testHeartbeat() {
        log.info("Scheduler heartbeat — system is alive and scheduling is enabled");
    }
}