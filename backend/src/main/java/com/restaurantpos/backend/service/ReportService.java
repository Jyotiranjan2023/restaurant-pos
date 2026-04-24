package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.response.*;
import com.restaurantpos.backend.dto.response.GstReportResponse.GstRateBreakdown;
import com.restaurantpos.backend.dto.response.SalesReportResponse.DailySales;
import com.restaurantpos.backend.entity.Bill;
import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.entity.Payment;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.enums.PaymentMethod;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.repository.BillRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BillRepository billRepo;

    public ReportService(BillRepository billRepo) {
        this.billRepo = billRepo;
    }

    // ========== SALES REPORT ==========

    public SalesReportResponse getSalesReport(String fromStr, String toStr) {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        List<Bill> bills = billRepo.findPaidByTenantAndDateRange(tenantId, range.from, range.to);

        SalesReportResponse report = new SalesReportResponse();
        report.setFromDate(range.fromDate.toString());
        report.setToDate(range.toDate.toString());

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalSubtotal = BigDecimal.ZERO;
        BigDecimal totalGst = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        long totalItemsSold = 0;

        for (Bill b : bills) {
            totalRevenue = totalRevenue.add(b.getTotalAmount());
            totalSubtotal = totalSubtotal.add(b.getSubtotal());
            totalGst = totalGst.add(b.getGstAmount());
            totalDiscount = totalDiscount.add(b.getDiscountAmount());

            for (OrderItem item : b.getOrder().getItems()) {
                if (item.getStatus() != OrderItemStatus.CANCELLED) {
                    totalItemsSold += item.getQuantity();
                }
            }
        }

        report.setTotalBills((long) bills.size());
        report.setTotalOrders((long) bills.size());
        report.setTotalRevenue(totalRevenue);
        report.setTotalSubtotal(totalSubtotal);
        report.setTotalGst(totalGst);
        report.setTotalDiscount(totalDiscount);
        report.setTotalItemsSold(totalItemsSold);

        if (!bills.isEmpty()) {
            report.setAvgOrderValue(totalRevenue.divide(
                    BigDecimal.valueOf(bills.size()), 2, RoundingMode.HALF_UP));
        } else {
            report.setAvgOrderValue(BigDecimal.ZERO);
        }

        // Daily breakdown
        report.setDailySales(computeDailySales(tenantId, range.fromDate, range.toDate));

        return report;
    }

    private List<DailySales> computeDailySales(Long tenantId, LocalDate from, LocalDate to) {
        List<DailySales> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            LocalDateTime dayStart = cursor.atStartOfDay();
            LocalDateTime dayEnd = cursor.atTime(23, 59, 59);

            List<Bill> dayBills = billRepo.findPaidByTenantAndDateRange(tenantId, dayStart, dayEnd);

            BigDecimal revenue = dayBills.stream()
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal gst = dayBills.stream()
                    .map(Bill::getGstAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal discount = dayBills.stream()
                    .map(Bill::getDiscountAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(new DailySales(
                cursor.format(fmt),
                (long) dayBills.size(),
                revenue, gst, discount
            ));
            cursor = cursor.plusDays(1);
        }

        return result;
    }

    // ========== PRODUCT REPORT ==========

    public List<ProductReportResponse> getProductReport(String fromStr, String toStr) {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        List<Bill> bills = billRepo.findPaidByTenantAndDateRange(tenantId, range.from, range.to);

        // Map<productId, [name, category, qty, revenue]>
        Map<Long, Object[]> productMap = new HashMap<>();

        for (Bill b : bills) {
            for (OrderItem item : b.getOrder().getItems()) {
                if (item.getStatus() == OrderItemStatus.CANCELLED) continue;
                if (Boolean.TRUE.equals(item.getIsCustom())) continue;
                if (item.getProduct() == null) continue;

                Long pid = item.getProduct().getId();
                String name = item.getItemName();
                String category = item.getProduct().getCategory() != null
                        ? item.getProduct().getCategory().getName() : "Uncategorized";

                Object[] row = productMap.get(pid);
                if (row == null) {
                    productMap.put(pid, new Object[]{name, category,
                            (long) item.getQuantity(), item.getSubtotal()});
                } else {
                    row[2] = (Long) row[2] + item.getQuantity();
                    row[3] = ((BigDecimal) row[3]).add(item.getSubtotal());
                }
            }
        }

        return productMap.entrySet().stream()
                .map(e -> {
                    Long qty = (Long) e.getValue()[2];
                    BigDecimal rev = (BigDecimal) e.getValue()[3];
                    BigDecimal avg = qty > 0
                            ? rev.divide(BigDecimal.valueOf(qty), 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return new ProductReportResponse(
                            e.getKey(),
                            (String) e.getValue()[0],
                            (String) e.getValue()[1],
                            qty, rev, avg);
                })
                .sorted((a, b) -> b.getRevenue().compareTo(a.getRevenue()))
                .collect(Collectors.toList());
    }

    // ========== STAFF REPORT ==========

    public List<StaffReportResponse> getStaffReport(String fromStr, String toStr) {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        List<Bill> bills = billRepo.findPaidByTenantAndDateRange(tenantId, range.from, range.to);

        // Map<userId, [username, fullName, role, orderCount, revenue]>
        Map<Long, Object[]> staffMap = new HashMap<>();

        for (Bill b : bills) {
            if (b.getOrder().getCreatedBy() == null) continue;

            var user = b.getOrder().getCreatedBy();
            Long uid = user.getId();

            Object[] row = staffMap.get(uid);
            if (row == null) {
                staffMap.put(uid, new Object[]{
                        user.getUsername(), user.getFullName(), user.getRole(),
                        1L, b.getTotalAmount()
                });
            } else {
                row[3] = (Long) row[3] + 1;
                row[4] = ((BigDecimal) row[4]).add(b.getTotalAmount());
            }
        }

        return staffMap.entrySet().stream()
                .map(e -> new StaffReportResponse(
                        e.getKey(),
                        (String) e.getValue()[0],
                        (String) e.getValue()[1],
                        (com.restaurantpos.backend.enums.Role) e.getValue()[2],
                        (Long) e.getValue()[3],
                        (BigDecimal) e.getValue()[4]))
                .sorted((a, b) -> b.getTotalSales().compareTo(a.getTotalSales()))
                .collect(Collectors.toList());
    }

    // ========== GST REPORT ==========

    public GstReportResponse getGstReport(String fromStr, String toStr) {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        List<Bill> bills = billRepo.findPaidByTenantAndDateRange(tenantId, range.from, range.to);

        GstReportResponse report = new GstReportResponse();
        report.setFromDate(range.fromDate.toString());
        report.setToDate(range.toDate.toString());

        // Group by GST rate
        // Map<gstPercent, [taxableAmount, gstAmount]>
        Map<BigDecimal, BigDecimal[]> rateMap = new TreeMap<>();

        BigDecimal totalTaxable = BigDecimal.ZERO;
        BigDecimal totalGst = BigDecimal.ZERO;
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Bill b : bills) {
            grandTotal = grandTotal.add(b.getTotalAmount());

            for (OrderItem item : b.getOrder().getItems()) {
                if (item.getStatus() == OrderItemStatus.CANCELLED) continue;

                BigDecimal rate = item.getGstPercent() != null ? item.getGstPercent() : BigDecimal.ZERO;
                BigDecimal itemTaxable = item.getSubtotal();
                BigDecimal itemGst = itemTaxable.multiply(rate)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                totalTaxable = totalTaxable.add(itemTaxable);
                totalGst = totalGst.add(itemGst);

                BigDecimal[] row = rateMap.get(rate);
                if (row == null) {
                    rateMap.put(rate, new BigDecimal[]{itemTaxable, itemGst});
                } else {
                    row[0] = row[0].add(itemTaxable);
                    row[1] = row[1].add(itemGst);
                }
            }
        }

        report.setTotalTaxableAmount(totalTaxable);
        report.setTotalGst(totalGst);
        report.setTotalCgst(totalGst.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP));
        report.setTotalSgst(totalGst.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP));
        report.setGrandTotal(grandTotal);

        // Build rate breakdowns
        List<GstRateBreakdown> breakdowns = new ArrayList<>();
        for (Map.Entry<BigDecimal, BigDecimal[]> e : rateMap.entrySet()) {
            BigDecimal taxable = e.getValue()[0];
            BigDecimal gst = e.getValue()[1];
            BigDecimal half = gst.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            breakdowns.add(new GstRateBreakdown(
                    e.getKey(), taxable, half, half, taxable.add(gst)));
        }
        report.setRateBreakdowns(breakdowns);

        return report;
    }

    // ========== PAYMENT METHOD REPORT ==========

    public List<PaymentMethodReportResponse> getPaymentMethodReport(String fromStr, String toStr) {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        List<Bill> bills = billRepo.findPaidByTenantAndDateRange(tenantId, range.from, range.to);

        // Map<method, [count, amount]>
        Map<PaymentMethod, Object[]> methodMap = new EnumMap<>(PaymentMethod.class);
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Bill b : bills) {
            for (Payment p : b.getPayments()) {
                grandTotal = grandTotal.add(p.getAmount());

                Object[] row = methodMap.get(p.getMethod());
                if (row == null) {
                    methodMap.put(p.getMethod(), new Object[]{1L, p.getAmount()});
                } else {
                    row[0] = (Long) row[0] + 1;
                    row[1] = ((BigDecimal) row[1]).add(p.getAmount());
                }
            }
        }

        final BigDecimal total = grandTotal;
        return methodMap.entrySet().stream()
                .map(e -> {
                    BigDecimal amount = (BigDecimal) e.getValue()[1];
                    BigDecimal pct = total.compareTo(BigDecimal.ZERO) > 0
                            ? amount.multiply(BigDecimal.valueOf(100))
                                    .divide(total, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return new PaymentMethodReportResponse(
                            e.getKey(), (Long) e.getValue()[0], amount, pct);
                })
                .sorted((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()))
                .collect(Collectors.toList());
    }

    // ========== HELPERS ==========

    private static class DateRange {
        LocalDate fromDate;
        LocalDate toDate;
        LocalDateTime from;
        LocalDateTime to;
    }

    private DateRange parseDateRange(String fromStr, String toStr) {
        try {
            DateRange range = new DateRange();
            range.fromDate = LocalDate.parse(fromStr);
            range.toDate = LocalDate.parse(toStr);

            if (range.fromDate.isAfter(range.toDate))
                throw new BadRequestException("'from' date cannot be after 'to' date");

            long days = java.time.temporal.ChronoUnit.DAYS.between(range.fromDate, range.toDate);
            if (days > 366)
                throw new BadRequestException("Date range cannot exceed 366 days");

            range.from = range.fromDate.atStartOfDay();
            range.to = range.toDate.atTime(23, 59, 59);
            return range;
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid date format. Use YYYY-MM-DD");
        }
    }
}