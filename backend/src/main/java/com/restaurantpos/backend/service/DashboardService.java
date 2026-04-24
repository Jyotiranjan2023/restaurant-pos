package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.response.DashboardSummaryResponse;
import com.restaurantpos.backend.dto.response.DashboardSummaryResponse.DailyRevenue;
import com.restaurantpos.backend.dto.response.DashboardSummaryResponse.TopProduct;
import com.restaurantpos.backend.entity.Bill;
import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.entity.Payment;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.repository.BillRepository;
import com.restaurantpos.backend.repository.IngredientRepository;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final BillRepository billRepo;
    private final OrderRepository orderRepo;
    private final IngredientRepository ingredientRepo;
    private final UserRepository userRepo;

    public DashboardService(BillRepository billRepo,
                            OrderRepository orderRepo,
                            IngredientRepository ingredientRepo,
                            UserRepository userRepo) {
        this.billRepo = billRepo;
        this.orderRepo = orderRepo;
        this.ingredientRepo = ingredientRepo;
        this.userRepo = userRepo;
    }

    public DashboardSummaryResponse getSummary() {
        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(23, 59, 59);

        DashboardSummaryResponse response = new DashboardSummaryResponse();

        // ===== Today's paid bills =====
        List<Bill> todayBills = billRepo
                .findPaidByTenantAndDateRange(tenantId, startOfToday, endOfToday);

        response.setTodayOrderCount((long) todayBills.size());
        response.setTodayRevenue(todayBills.stream()
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        // ===== Running orders =====
        response.setRunningOrderCount(orderRepo.countRunningByTenant(tenantId));

        // ===== Low stock count =====
        response.setLowStockCount((long) ingredientRepo.findLowStockByTenantId(tenantId).size());

        // ===== Active staff count =====
        long activeStaff = userRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .count();
        response.setActiveStaffCount(activeStaff);

        // ===== Revenue by order type =====
        Map<String, BigDecimal> byOrderType = new HashMap<>();
        for (Bill b : todayBills) {
            String type = b.getOrder().getOrderType().name();
            byOrderType.merge(type, b.getTotalAmount(), BigDecimal::add);
        }
        response.setRevenueByOrderType(byOrderType);

        // ===== Revenue by payment method =====
        Map<String, BigDecimal> byPaymentMethod = new HashMap<>();
        for (Bill b : todayBills) {
            for (Payment p : b.getPayments()) {
                String method = p.getMethod().name();
                byPaymentMethod.merge(method, p.getAmount(), BigDecimal::add);
            }
        }
        response.setRevenueByPaymentMethod(byPaymentMethod);

        // ===== Top 5 selling products today =====
        response.setTopSellingProducts(computeTopSellers(todayBills));

        // ===== Last 7 days trend =====
        response.setLast7DaysRevenue(computeLast7Days(tenantId, today));

        return response;
    }

    // ========== Helpers ==========

    private List<TopProduct> computeTopSellers(List<Bill> todayBills) {
        // Map<productId, [name, qty, revenue]>
        Map<Long, Object[]> productMap = new HashMap<>();

        for (Bill b : todayBills) {
            for (OrderItem item : b.getOrder().getItems()) {
                if (item.getStatus() == OrderItemStatus.CANCELLED) continue;
                if (Boolean.TRUE.equals(item.getIsCustom())) continue;  // skip custom items
                if (item.getProduct() == null) continue;

                Long pid = item.getProduct().getId();
                Object[] existing = productMap.get(pid);
                if (existing == null) {
                    productMap.put(pid, new Object[]{
                        item.getItemName(),
                        (long) item.getQuantity(),
                        item.getSubtotal()
                    });
                } else {
                    existing[1] = (Long) existing[1] + item.getQuantity();
                    existing[2] = ((BigDecimal) existing[2]).add(item.getSubtotal());
                }
            }
        }

        return productMap.entrySet().stream()
                .map(e -> new TopProduct(
                        e.getKey(),
                        (String) e.getValue()[0],
                        (Long) e.getValue()[1],
                        (BigDecimal) e.getValue()[2]))
                .sorted((a, b) -> Long.compare(b.getQuantitySold(), a.getQuantitySold()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<DailyRevenue> computeLast7Days(Long tenantId, LocalDate today) {
        List<DailyRevenue> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);

            List<Bill> dayBills = billRepo.findPaidByTenantAndDateRange(tenantId, start, end);

            BigDecimal revenue = dayBills.stream()
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(new DailyRevenue(date.format(formatter), revenue, (long) dayBills.size()));
        }

        return result;
    }
}