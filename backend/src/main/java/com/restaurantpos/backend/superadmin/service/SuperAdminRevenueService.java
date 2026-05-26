package com.restaurantpos.backend.superadmin.service;

import com.restaurantpos.backend.entity.Subscription;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.enums.SubscriptionStatus;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import com.restaurantpos.backend.repository.SubscriptionRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.superadmin.dto.SuperAdminRevenueResponse;
import com.restaurantpos.backend.superadmin.dto.SuperAdminRevenueResponse.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SuperAdminRevenueService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("d MMM yyyy");
    private static final DateTimeFormatter MONTH_FMT =
            DateTimeFormatter.ofPattern("MMM yyyy");

    public SuperAdminRevenueResponse getRevenue() {
        SuperAdminRevenueResponse res = new SuperAdminRevenueResponse();

        // All subscriptions with plan prices (exclude LIFETIME_FREE — they pay nothing)
        List<Subscription> allSubs = subscriptionRepository.findAll();
        List<Tenant>       allTenants = tenantRepository.findAll();

        // Build planId → priceInr map
        Map<Long, Double>  planPriceMap = new HashMap<>();
        Map<Long, String>  planNameMap  = new HashMap<>();
        Map<Long, String>  planCodeMap  = new HashMap<>();
        planRepository.findAll().forEach(p -> {
            planPriceMap.put(p.getId(), p.getPriceInr() != null ? p.getPriceInr().doubleValue() : 0.0);
            planNameMap.put(p.getId(),  p.getName());
            planCodeMap.put(p.getId(),  p.getCode());
        });

        // Build tenantId → Tenant map
        Map<Long, Tenant> tenantMap = allTenants.stream()
                .collect(Collectors.toMap(Tenant::getId, t -> t));

        LocalDateTime now = LocalDateTime.now();

        // ── Active paying subs (ACTIVE only — not trial, not lifetime) ──
        List<Subscription> activePaying = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .collect(Collectors.toList());

        long activePayingCount = activePaying.size();
        res.setActivePayingTenants(activePayingCount);

        // ── Current MRR ──
        double mrr = activePaying.stream()
                .mapToDouble(s -> planPriceMap.getOrDefault(s.getPlanId(), 0.0))
                .sum();
        res.setCurrentMrr(mrr);

        // ── Total revenue all time (all ACTIVE + past paid subs) ──
        double totalRevenue = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE
                          || s.getStatus() == SubscriptionStatus.GRACE_PERIOD
                          || s.getStatus() == SubscriptionStatus.SUSPENDED
                          || s.getStatus() == SubscriptionStatus.CANCELLED)
                .mapToDouble(s -> planPriceMap.getOrDefault(s.getPlanId(), 0.0))
                .sum();
        res.setTotalRevenueAllTime(totalRevenue);

        // ── Revenue this month ──
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        double revenueThisMonth = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE
                        && s.getStartedAt() != null
                        && !s.getStartedAt().isBefore(startOfMonth))
                .mapToDouble(s -> planPriceMap.getOrDefault(s.getPlanId(), 0.0))
                .sum();
        res.setRevenueThisMonth(revenueThisMonth);

        // ── Avg revenue per tenant ──
        res.setAvgRevenuePerTenant(
                activePayingCount > 0 ? Math.round((mrr / activePayingCount) * 100.0) / 100.0 : 0.0
        );

        // ── Monthly revenue — last 6 months ──
        List<MonthlyRevenue> monthly = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i)
                    .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);

            long count = allSubs.stream()
                    .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE
                            && s.getStartedAt() != null
                            && !s.getStartedAt().isBefore(monthStart)
                            && s.getStartedAt().isBefore(monthEnd))
                    .count();

            double rev = allSubs.stream()
                    .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE
                            && s.getStartedAt() != null
                            && !s.getStartedAt().isBefore(monthStart)
                            && s.getStartedAt().isBefore(monthEnd))
                    .mapToDouble(s -> planPriceMap.getOrDefault(s.getPlanId(), 0.0))
                    .sum();

            monthly.add(new MonthlyRevenue(monthStart.format(MONTH_FMT), rev, count));
        }
        res.setMonthlyRevenue(monthly);

        // ── Plan breakdown ──
        Map<Long, List<Subscription>> byPlan = activePaying.stream()
                .collect(Collectors.groupingBy(Subscription::getPlanId));

        List<PlanRevenue> planBreakdown = byPlan.entrySet().stream()
                .map(e -> {
                    Long   planId    = e.getKey();
                    long   count     = e.getValue().size();
                    double price     = planPriceMap.getOrDefault(planId, 0.0);
                    return new PlanRevenue(
                            planNameMap.getOrDefault(planId, "Unknown"),
                            planCodeMap.getOrDefault(planId, ""),
                            count,
                            price,
                            price * count
                    );
                })
                .sorted(Comparator.comparingDouble(PlanRevenue::getTotalRevenue).reversed())
                .collect(Collectors.toList());
        res.setPlanBreakdown(planBreakdown);

        // ── Per-tenant revenue table ──
        List<TenantRevenue> tenantRevenues = activePaying.stream()
                .map(s -> {
                    Tenant t = tenantMap.get(s.getTenantId());
                    if (t == null) return null;
                    double price = planPriceMap.getOrDefault(s.getPlanId(), 0.0);
                    Integer days = calculateDaysRemaining(s, now);
                    String expires = s.getExpiresAt() != null
                            ? s.getExpiresAt().format(DATE_FMT) : "—";
                    return new TenantRevenue(
                            t.getId(),
                            t.getRestaurantName(),
                            t.getEmail(),
                            planNameMap.getOrDefault(s.getPlanId(), "Unknown"),
                            s.getStatus().toString(),
                            price,
                            expires,
                            days
                    );
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(TenantRevenue::getMonthlyRevenue).reversed())
                .collect(Collectors.toList());
        res.setTenantRevenues(tenantRevenues);

        // ── Upcoming renewals — next 30 days ──
        LocalDateTime in30Days = now.plusDays(30);
        List<UpcomingRenewal> renewals = activePaying.stream()
                .filter(s -> s.getExpiresAt() != null
                        && s.getExpiresAt().isAfter(now)
                        && s.getExpiresAt().isBefore(in30Days))
                .map(s -> {
                    Tenant t = tenantMap.get(s.getTenantId());
                    if (t == null) return null;
                    double price  = planPriceMap.getOrDefault(s.getPlanId(), 0.0);
                    int    days   = (int) ChronoUnit.DAYS.between(now, s.getExpiresAt());
                    String expires = s.getExpiresAt().format(DATE_FMT);
                    return new UpcomingRenewal(
                            t.getId(),
                            t.getRestaurantName(),
                            t.getEmail(),
                            planNameMap.getOrDefault(s.getPlanId(), "Unknown"),
                            price,
                            expires,
                            days
                    );
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(UpcomingRenewal::getDaysUntilRenewal))
                .collect(Collectors.toList());
        res.setUpcomingRenewals(renewals);

        // ── Churn this month ──
        res.setCancelledThisMonth(
                allSubs.stream()
                        .filter(s -> s.getStatus() == SubscriptionStatus.CANCELLED
                                && s.getUpdatedAt() != null
                                && !s.getUpdatedAt().isBefore(startOfMonth))
                        .count()
        );
        res.setSuspendedThisMonth(
                allSubs.stream()
                        .filter(s -> s.getStatus() == SubscriptionStatus.SUSPENDED
                                && s.getUpdatedAt() != null
                                && !s.getUpdatedAt().isBefore(startOfMonth))
                        .count()
        );

        return res;
    }

    private Integer calculateDaysRemaining(Subscription sub, LocalDateTime now) {
        if (sub.getStatus() == SubscriptionStatus.LIFETIME_FREE) return null;
        LocalDateTime relevant = sub.getExpiresAt();
        if (relevant == null) return 0;
        if (!relevant.isAfter(now)) return 0;
        long secs = ChronoUnit.SECONDS.between(now, relevant);
        return (int) ((secs + 86399) / 86400);
    }
}