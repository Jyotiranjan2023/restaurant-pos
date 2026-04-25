package com.restaurantpos.backend.service;

import com.restaurantpos.backend.entity.Bill;
import com.restaurantpos.backend.entity.Customer;
import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.entity.Payment;
import com.restaurantpos.backend.entity.Product;
import com.restaurantpos.backend.enums.BillStatus;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.repository.BillRepository;
import com.restaurantpos.backend.repository.CustomerRepository;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.ProductRepository;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.util.CsvWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class ExportService {

    private final OrderRepository orderRepo;
    private final BillRepository billRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;

    public ExportService(OrderRepository orderRepo,
                         BillRepository billRepo,
                         ProductRepository productRepo,
                         CustomerRepository customerRepo) {
        this.orderRepo = orderRepo;
        this.billRepo = billRepo;
        this.productRepo = productRepo;
        this.customerRepo = customerRepo;
    }

    // ========== ORDERS EXPORT ==========

    public void exportOrders(String fromStr, String toStr, HttpServletResponse response)
            throws IOException {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        String filename = "orders_" + range.fromDate + "_to_" + range.toDate + ".csv";

        try (CsvWriter csv = new CsvWriter(response, filename)) {
            // Header
            csv.writeRow(
                "Order Number", "Date", "Type", "Status", "Table",
                "Customer Name", "Customer Phone",
                "Items Count", "Subtotal", "GST", "Discount",
                "Total Amount", "Created By"
            );

            List<Order> orders = orderRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                    .filter(o -> !o.getCreatedAt().isBefore(range.from))
                    .filter(o -> !o.getCreatedAt().isAfter(range.to))
                    .toList();

            for (Order o : orders) {
                int itemCount = (int) o.getItems().stream()
                        .filter(i -> i.getStatus() != OrderItemStatus.CANCELLED)
                        .mapToInt(OrderItem::getQuantity)
                        .sum();

                csv.writeRow(
                    o.getOrderNumber(),
                    formatDate(o.getCreatedAt()),
                    o.getOrderType(),
                    o.getStatus(),
                    o.getTable() != null ? o.getTable().getTableNumber() : "",
                    safe(o.getCustomerName()),
                    safe(o.getCustomerPhone()),
                    itemCount,
                    o.getSubtotal(),
                    o.getGstAmount(),
                    o.getDiscount(),
                    o.getTotalAmount(),
                    o.getCreatedBy() != null ? o.getCreatedBy().getUsername() : ""
                );
            }
        }
    }

    // ========== BILLS EXPORT ==========

    public void exportBills(String fromStr, String toStr, HttpServletResponse response)
            throws IOException {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        String filename = "bills_" + range.fromDate + "_to_" + range.toDate + ".csv";

        try (CsvWriter csv = new CsvWriter(response, filename)) {
            csv.writeRow(
                "Bill Number", "Order Number", "Bill Date", "Settled Date", "Status",
                "Customer Name", "Customer Phone",
                "Subtotal", "GST", "Discount", "Total",
                "Paid Amount", "Due Amount",
                "Coupon Code", "Payment Methods"
            );

            List<Bill> bills = billRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                    .filter(b -> !b.getCreatedAt().isBefore(range.from))
                    .filter(b -> !b.getCreatedAt().isAfter(range.to))
                    .toList();

            for (Bill b : bills) {
                String paymentMethods = b.getPayments().stream()
                        .map(p -> p.getMethod() + ":" + p.getAmount())
                        .reduce((a, c) -> a + " | " + c)
                        .orElse("");

                csv.writeRow(
                    b.getBillNumber(),
                    b.getOrder().getOrderNumber(),
                    formatDate(b.getCreatedAt()),
                    b.getSettledAt() != null ? formatDate(b.getSettledAt()) : "",
                    b.getStatus(),
                    safe(b.getOrder().getCustomerName()),
                    safe(b.getOrder().getCustomerPhone()),
                    b.getSubtotal(),
                    b.getGstAmount(),
                    b.getDiscountAmount(),
                    b.getTotalAmount(),
                    b.getPaidAmount(),
                    b.getDueAmount(),
                    safe(b.getCouponCode()),
                    paymentMethods
                );
            }
        }
    }

    // ========== PRODUCTS EXPORT ==========

    public void exportProducts(HttpServletResponse response) throws IOException {
        Long tenantId = TenantContext.getCurrentTenantId();

        String filename = "products_" + LocalDate.now() + ".csv";

        try (CsvWriter csv = new CsvWriter(response, filename)) {
            csv.writeRow(
                "ID", "Name", "Description", "Category",
                "Price", "GST %", "Available", "Active",
                "Image URL"
            );

            List<Product> products = productRepo.findAll().stream()
                    .filter(p -> p.getTenant() != null && p.getTenant().getId().equals(tenantId))
                    .filter(p -> Boolean.TRUE.equals(p.getActive()))
                    .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                    .toList();

            for (Product p : products) {
                csv.writeRow(
                    p.getId(),
                    safe(p.getName()),
                    safe(p.getDescription()),
                    p.getCategory() != null ? p.getCategory().getName() : "",
                    p.getPrice(),
                    p.getGstPercent(),
                    p.getAvailable(),
                    p.getActive(),
                    safe(p.getImageUrl())
                );
            }
        }
    }

    // ========== CUSTOMERS EXPORT ==========

    public void exportCustomers(HttpServletResponse response) throws IOException {
        Long tenantId = TenantContext.getCurrentTenantId();

        String filename = "customers_" + LocalDate.now() + ".csv";

        try (CsvWriter csv = new CsvWriter(response, filename)) {
            csv.writeRow(
                "ID", "Name", "Phone", "Email", "Address",
                "Visit Count", "Total Spent", "Last Visit",
                "VIP", "Customer Since"
            );

            List<Customer> customers = customerRepo
                    .findByTenantIdAndActiveTrueOrderByCreatedAtDesc(tenantId);

            for (Customer c : customers) {
                csv.writeRow(
                    c.getId(),
                    safe(c.getName()),
                    safe(c.getPhone()),
                    safe(c.getEmail()),
                    safe(c.getAddress()),
                    c.getVisitCount(),
                    c.getTotalSpent(),
                    c.getLastVisitAt() != null ? formatDate(c.getLastVisitAt()) : "",
                    c.getVip() ? "Yes" : "No",
                    formatDate(c.getCreatedAt())
                );
            }
        }
    }

    // ========== SALES REPORT EXPORT ==========

    public void exportSales(String fromStr, String toStr, HttpServletResponse response)
            throws IOException {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        String filename = "sales_" + range.fromDate + "_to_" + range.toDate + ".csv";

        try (CsvWriter csv = new CsvWriter(response, filename)) {
            csv.writeRow(
                "Date", "Total Bills", "Total Orders",
                "Subtotal", "GST", "Discount", "Total Revenue"
            );

            // Group bills by date
            Map<LocalDate, BigDecimal[]> dailyMap = new TreeMap<>();
            // [count, subtotal, gst, discount, total]

            List<Bill> bills = billRepo
                    .findPaidByTenantAndDateRange(tenantId, range.from, range.to);

            for (Bill b : bills) {
                LocalDate date = b.getSettledAt().toLocalDate();
                BigDecimal[] row = dailyMap.computeIfAbsent(date, k -> new BigDecimal[]{
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO, BigDecimal.ZERO
                });
                row[0] = row[0].add(BigDecimal.ONE);
                row[1] = row[1].add(b.getSubtotal());
                row[2] = row[2].add(b.getGstAmount());
                row[3] = row[3].add(b.getDiscountAmount());
                row[4] = row[4].add(b.getTotalAmount());
            }

            // Write rows + grand total
            BigDecimal[] grandTotal = new BigDecimal[]{
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO
            };

            for (Map.Entry<LocalDate, BigDecimal[]> e : dailyMap.entrySet()) {
                BigDecimal[] r = e.getValue();
                csv.writeRow(
                    e.getKey(),
                    r[0].intValue(),       // bills count
                    r[0].intValue(),       // orders count (1:1 with bills)
                    r[1], r[2], r[3], r[4]
                );
                for (int i = 0; i < 5; i++) grandTotal[i] = grandTotal[i].add(r[i]);
            }

            // Total row
            csv.writeRow("");
            csv.writeRow(
                "GRAND TOTAL",
                grandTotal[0].intValue(),
                grandTotal[0].intValue(),
                grandTotal[1], grandTotal[2], grandTotal[3], grandTotal[4]
            );
        }
    }

    // ========== GST REPORT EXPORT ==========

    public void exportGst(String fromStr, String toStr, HttpServletResponse response)
            throws IOException {
        Long tenantId = TenantContext.getCurrentTenantId();
        DateRange range = parseDateRange(fromStr, toStr);

        String filename = "gst_report_" + range.fromDate + "_to_" + range.toDate + ".csv";

        try (CsvWriter csv = new CsvWriter(response, filename)) {
            csv.writeRow(
                "Bill Number", "Bill Date",
                "Taxable Amount", "GST %", "CGST", "SGST", "Total GST",
                "Bill Total"
            );

            List<Bill> bills = billRepo
                    .findPaidByTenantAndDateRange(tenantId, range.from, range.to);

            BigDecimal totalTaxable = BigDecimal.ZERO;
            BigDecimal totalCgst = BigDecimal.ZERO;
            BigDecimal totalSgst = BigDecimal.ZERO;
            BigDecimal totalGst = BigDecimal.ZERO;
            BigDecimal totalBill = BigDecimal.ZERO;

            for (Bill b : bills) {
                // For each bill, sum taxable per GST rate
                Map<BigDecimal, BigDecimal[]> rateMap = new HashMap<>();
                for (OrderItem item : b.getOrder().getItems()) {
                    if (item.getStatus() == OrderItemStatus.CANCELLED) continue;
                    BigDecimal rate = item.getGstPercent() != null
                            ? item.getGstPercent() : BigDecimal.ZERO;
                    BigDecimal taxable = item.getSubtotal();
                    BigDecimal gst = taxable.multiply(rate)
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    BigDecimal[] row = rateMap.computeIfAbsent(rate,
                            k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                    row[0] = row[0].add(taxable);
                    row[1] = row[1].add(gst);
                }

                // One CSV row per (bill × GST rate)
                for (Map.Entry<BigDecimal, BigDecimal[]> e : rateMap.entrySet()) {
                    BigDecimal rate = e.getKey();
                    BigDecimal taxable = e.getValue()[0];
                    BigDecimal gst = e.getValue()[1];
                    BigDecimal half = gst.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);

                    csv.writeRow(
                        b.getBillNumber(),
                        formatDate(b.getCreatedAt()),
                        taxable, rate, half, half, gst,
                        b.getTotalAmount()
                    );

                    totalTaxable = totalTaxable.add(taxable);
                    totalCgst = totalCgst.add(half);
                    totalSgst = totalSgst.add(half);
                    totalGst = totalGst.add(gst);
                }
                totalBill = totalBill.add(b.getTotalAmount());
            }

            // Grand total
            csv.writeRow("");
            csv.writeRow(
                "GRAND TOTAL", "",
                totalTaxable, "", totalCgst, totalSgst, totalGst,
                totalBill
            );
        }
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

    private String formatDate(LocalDateTime dt) {
        if (dt == null) return "";
        return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    private String safe(String s) {
        return s != null ? s : "";
    }
}