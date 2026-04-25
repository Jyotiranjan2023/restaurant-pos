package com.restaurantpos.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurantpos.backend.dto.request.AddPaymentRequest;
import com.restaurantpos.backend.dto.request.ApplyDiscountRequest;
import com.restaurantpos.backend.dto.request.CancelBillRequest;
import com.restaurantpos.backend.dto.response.BillResponse;
import com.restaurantpos.backend.dto.response.OrderItemResponse;
import com.restaurantpos.backend.dto.response.PaymentResponse;
import com.restaurantpos.backend.dto.response.PrintableBillResponse;
import com.restaurantpos.backend.entity.Bill;
import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.entity.Payment;
import com.restaurantpos.backend.entity.RestaurantTable;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.enums.BillStatus;
import com.restaurantpos.backend.enums.DiscountType;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.enums.OrderStatus;
import com.restaurantpos.backend.enums.TableStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.BillRepository;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.PaymentRepository;
import com.restaurantpos.backend.repository.RestaurantTableRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.security.UserPrincipal;

@Service
public class BillService {

	
	private final CouponService couponService;
	private final NotificationService notificationService;
    private final BillRepository billRepo;
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final PaymentRepository paymentRepo;
    private final RestaurantTableRepository tableRepo;
    private final CustomerService customerService;
  

    public BillService(BillRepository billRepo,
            OrderRepository orderRepo,
            UserRepository userRepo,
            TenantRepository tenantRepo,
            PaymentRepository paymentRepo,
            RestaurantTableRepository tableRepo,
            CustomerService customerService,
            CouponService couponService,
    NotificationService notificationService){   // ← NEW
this.billRepo = billRepo;
this.orderRepo = orderRepo;
this.userRepo = userRepo;
this.tenantRepo = tenantRepo;
this.paymentRepo = paymentRepo;
this.tableRepo = tableRepo;
this.customerService = customerService;
this.couponService = couponService; 
this.notificationService = notificationService;   // ← NEW// ← NEW
}
    /**
     * Generate a bill from a RUNNING order.
     * Copies financial totals from the order as a snapshot.
     */
    @Transactional
    public BillResponse generateBill(Long orderId) {
        UserPrincipal principal = TenantContext.getCurrentUser();
        Long tenantId = principal.getTenantId();

        Order order = orderRepo.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.RUNNING)
            throw new BadRequestException("Can only generate bill for a RUNNING order");

        // Prevent duplicate bill for same order
        if (billRepo.findByOrderIdAndTenantId(orderId, tenantId).isPresent())
            throw new BadRequestException("A bill already exists for this order");

        // Check there are non-cancelled items
        boolean hasItems = order.getItems().stream()
                .anyMatch(i -> i.getStatus() != OrderItemStatus.CANCELLED);
        if (!hasItems)
            throw new BadRequestException("Cannot generate bill — order has no active items");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        User currentUser = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Bill bill = new Bill();
        bill.setBillNumber(generateBillNumber(tenantId));
        bill.setOrder(order);
        bill.setSubtotal(order.getSubtotal());
        bill.setGstAmount(order.getGstAmount());
        bill.setDiscountAmount(BigDecimal.ZERO);
        bill.setTotalAmount(order.getSubtotal().add(order.getGstAmount()));
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setDueAmount(bill.getTotalAmount());
        bill.setStatus(BillStatus.PENDING);
        bill.setGeneratedBy(currentUser);
        bill.setTenant(tenant);

        bill = billRepo.save(bill);
        return toResponse(bill);
    }

    public BillResponse findById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Bill bill = billRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        return toResponse(bill);
    }

    public BillResponse findByOrderId(Long orderId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Bill bill = billRepo.findByOrderIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found for this order"));
        return toResponse(bill);
    }

    public List<BillResponse> findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return billRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Apply (or re-apply) discount to a bill.
     * Recalculates totalAmount and dueAmount.
     */
    @Transactional
    public BillResponse applyDiscount(Long billId, ApplyDiscountRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getStatus() == BillStatus.PAID)
            throw new BadRequestException("Cannot apply discount on a fully paid bill");
        if (bill.getStatus() == BillStatus.CANCELLED)
            throw new BadRequestException("Cannot apply discount on a cancelled bill");

        BigDecimal baseAmount = bill.getSubtotal().add(bill.getGstAmount());
        BigDecimal discountAmount;

        if (req.getDiscountType() == DiscountType.FLAT) {
            discountAmount = req.getDiscountValue();
            if (discountAmount.compareTo(baseAmount) > 0)
                throw new BadRequestException("Discount cannot be greater than bill amount");
        } else {
            // PERCENT
            if (req.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0)
                throw new BadRequestException("Percentage discount cannot exceed 100%");

            discountAmount = baseAmount
                    .multiply(req.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        bill.setDiscountType(req.getDiscountType());
        bill.setDiscountValue(req.getDiscountValue());
        bill.setDiscountAmount(discountAmount);
        bill.setTotalAmount(baseAmount.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP));
        bill.setDueAmount(bill.getTotalAmount().subtract(bill.getPaidAmount()));

        bill = billRepo.save(bill);
        return toResponse(bill);
    }

    // ========== Helpers ==========

    private String generateBillNumber(Long tenantId) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "BILL-" + tenantId + "-" + datePart + "-";
        long count = billRepo.countByTenantIdAndBillNumberStartingWith(tenantId, prefix);
        return prefix + String.format("%04d", count + 1);
    }

    private BillResponse toResponse(Bill b) {
        BillResponse r = new BillResponse();
        r.setId(b.getId());
        r.setBillNumber(b.getBillNumber());

        Order o = b.getOrder();
        r.setOrderId(o.getId());
        r.setOrderNumber(o.getOrderNumber());
        if (o.getTable() != null) r.setTableNumber(o.getTable().getTableNumber());
        r.setCustomerName(o.getCustomerName());
        r.setCustomerPhone(o.getCustomerPhone());

        r.setSubtotal(b.getSubtotal());
        r.setGstAmount(b.getGstAmount());
        r.setDiscountAmount(b.getDiscountAmount());
        r.setDiscountType(b.getDiscountType());
        r.setDiscountValue(b.getDiscountValue());
        r.setCouponCode(b.getCouponCode());
        r.setTotalAmount(b.getTotalAmount());
        r.setPaidAmount(b.getPaidAmount());
        r.setDueAmount(b.getDueAmount());
        r.setStatus(b.getStatus());

        r.setGeneratedByUsername(b.getGeneratedBy() != null ? b.getGeneratedBy().getUsername() : null);
        r.setCreatedAt(b.getCreatedAt());
        r.setSettledAt(b.getSettledAt());
        r.setCancelledAt(b.getCancelledAt());
        r.setCancellationReason(b.getCancellationReason());

        // Items snapshot
        List<OrderItemResponse> items = new ArrayList<>();
        for (OrderItem item : o.getItems()) {
            if (item.getStatus() == OrderItemStatus.CANCELLED) continue;  // skip cancelled
            OrderItemResponse ir = new OrderItemResponse();
            ir.setId(item.getId());
            ir.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
            ir.setItemName(item.getItemName());
            ir.setItemPrice(item.getItemPrice());
            ir.setQuantity(item.getQuantity());
            ir.setGstPercent(item.getGstPercent());
            ir.setSubtotal(item.getSubtotal());
            ir.setIsCustom(item.getIsCustom());
            ir.setStatus(item.getStatus());
            ir.setNotes(item.getNotes());
            items.add(ir);
        }
        r.setItems(items);

        // Payments
        List<PaymentResponse> payments = new ArrayList<>();
        for (Payment p : b.getPayments()) {
            PaymentResponse pr = new PaymentResponse();
            pr.setId(p.getId());
            pr.setMethod(p.getMethod());
            pr.setAmount(p.getAmount());
            pr.setReference(p.getReference());
            pr.setNotes(p.getNotes());
            pr.setReceivedByUsername(p.getReceivedBy() != null ? p.getReceivedBy().getUsername() : null);
            pr.setCreatedAt(p.getCreatedAt());
            payments.add(pr);
        }
        r.setPayments(payments);

        return r;
    }
    
 // ========== Phase 4.6b Methods ==========

    /**
     * Add a payment to a bill. Supports split payments — add multiple times with different methods.
     * Auto-settles the bill and closes the order when fully paid.
     */
    @Transactional
    public BillResponse addPayment(Long billId, AddPaymentRequest req) {
        UserPrincipal principal = TenantContext.getCurrentUser();
        Long tenantId = principal.getTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getStatus() == BillStatus.PAID)
            throw new BadRequestException("Bill is already fully paid");
        if (bill.getStatus() == BillStatus.CANCELLED)
            throw new BadRequestException("Cannot add payment to a cancelled bill");

        if (req.getAmount().compareTo(bill.getDueAmount()) > 0)
            throw new BadRequestException("Payment amount (₹" + req.getAmount() +
                    ") exceeds due amount (₹" + bill.getDueAmount() + ")");

        User currentUser = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create payment
        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setMethod(req.getMethod());
        payment.setAmount(req.getAmount());
        payment.setReference(req.getReference());
        payment.setNotes(req.getNotes());
        payment.setReceivedBy(currentUser);

        bill.getPayments().add(payment);

        // Update bill totals
        BigDecimal newPaidAmount = bill.getPaidAmount().add(req.getAmount());
        bill.setPaidAmount(newPaidAmount);
        bill.setDueAmount(bill.getTotalAmount().subtract(newPaidAmount).setScale(2, RoundingMode.HALF_UP));

        // Auto-settle if fully paid
        if (bill.getDueAmount().compareTo(BigDecimal.ZERO) <= 0) {
            settleBill(bill);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        bill = billRepo.save(bill);
        return toResponse(bill);
    }

    /**
     * Manually settle a bill (useful if frontend wants explicit settle button).
     * Bill must be fully paid before settlement.
     */
    @Transactional
    public BillResponse settleBillById(Long billId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getStatus() == BillStatus.PAID)
            throw new BadRequestException("Bill is already settled");
        if (bill.getStatus() == BillStatus.CANCELLED)
            throw new BadRequestException("Cannot settle a cancelled bill");

        if (bill.getDueAmount().compareTo(BigDecimal.ZERO) > 0)
            throw new BadRequestException("Cannot settle — amount due is ₹" + bill.getDueAmount());

        settleBill(bill);
        bill = billRepo.save(bill);
        return toResponse(bill);
    }

    /**
     * Cancel a bill (ADMIN only). Reverses order and frees table.
     */
    @Transactional
    public BillResponse cancelBill(Long billId, CancelBillRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getStatus() == BillStatus.CANCELLED)
            throw new BadRequestException("Bill is already cancelled");

        if (bill.getPaidAmount().compareTo(BigDecimal.ZERO) > 0)
            throw new BadRequestException("Cannot cancel bill with payments. Refund required first.");

        bill.setStatus(BillStatus.CANCELLED);
        bill.setCancelledAt(LocalDateTime.now());
        bill.setCancellationReason(req.getReason());

        // Cancel the associated order
        Order order = bill.getOrder();
        order.setStatus(OrderStatus.CANCELLED);
        for (OrderItem item : order.getItems()) {
            if (item.getStatus() != OrderItemStatus.CANCELLED &&
                item.getStatus() != OrderItemStatus.SERVED) {
                item.setStatus(OrderItemStatus.CANCELLED);
            }
        }

        // Free the table
        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus(TableStatus.AVAILABLE);
            tableRepo.save(table);
        }

        orderRepo.save(order);
        bill = billRepo.save(bill);

        // ===== NEW: Notification — bill cancelled =====
        notificationService.notifyForTenant(
                tenantId,
                com.restaurantpos.backend.enums.NotificationType.BILL_CANCELLED,
                com.restaurantpos.backend.enums.NotificationSeverity.WARNING,
                "Bill Cancelled",
                "Bill " + bill.getBillNumber() + " was cancelled. Reason: " +
                        (req.getReason() != null ? req.getReason() : "Not specified"),
                "/bills/" + bill.getId()
        );
        // ===== END NEW =====

        return toResponse(bill);
    }

    /**
     * Get complete printable bill data for frontend rendering.
     */
    public PrintableBillResponse getPrintableBill(Long billId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        return toPrintableResponse(bill);
    }

    /**
     * Get pre-formatted HTML bill, ready to render and print via window.print().
     */
    public String getPrintableBillHtml(Long billId) {
        PrintableBillResponse bill = getPrintableBill(billId);
        return buildBillHtml(bill);
    }

    // ========== Helpers ==========

    /**
     * Called when bill is fully paid (either auto from addPayment or manually via settleBillById).
     */
    private void settleBill(Bill bill) {
        bill.setStatus(BillStatus.PAID);
        bill.setSettledAt(LocalDateTime.now());

        // Close the order
        Order order = bill.getOrder();
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());

        // Mark all non-cancelled items as SERVED (if not already)
        for (OrderItem item : order.getItems()) {
            if (item.getStatus() == OrderItemStatus.NEW ||
                item.getStatus() == OrderItemStatus.PREPARING ||
                item.getStatus() == OrderItemStatus.READY) {
                item.setStatus(OrderItemStatus.SERVED);
            }
        }

        // Free the table
        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus(TableStatus.AVAILABLE);
            tableRepo.save(table);
        }

        orderRepo.save(order);

        // ===== NEW: Update customer aggregates (visit count, total spent, last visit) =====
        if (order.getCustomer() != null) {
            customerService.recordVisit(order.getCustomer(), bill.getTotalAmount());
        }
        // ===== END NEW =====
    }

    
    
    
    private PrintableBillResponse toPrintableResponse(Bill b) {
        PrintableBillResponse p = new PrintableBillResponse();

        // Restaurant
        Tenant t = b.getTenant();
        p.setRestaurantName(t.getRestaurantName());
        p.setRestaurantAddress(t.getAddress());
        p.setRestaurantPhone(t.getPhone());
        p.setGstNumber(t.getGstNumber());
        p.setFssaiNumber(t.getFssaiNumber());

        // Bill info
        p.setBillNumber(b.getBillNumber());
        p.setOrderNumber(b.getOrder().getOrderNumber());
        p.setOrderType(b.getOrder().getOrderType());
        if (b.getOrder().getTable() != null)
            p.setTableNumber(b.getOrder().getTable().getTableNumber());
        p.setBillDate(b.getCreatedAt());
        p.setOrderDate(b.getOrder().getCreatedAt());

        // Customer
        p.setCustomerName(b.getOrder().getCustomerName());
        p.setCustomerPhone(b.getOrder().getCustomerPhone());
        p.setCustomerAddress(b.getOrder().getCustomerAddress());

        // Items (exclude cancelled)
        List<OrderItemResponse> items = new ArrayList<>();
        for (OrderItem item : b.getOrder().getItems()) {
            if (item.getStatus() == OrderItemStatus.CANCELLED) continue;
            OrderItemResponse ir = new OrderItemResponse();
            ir.setId(item.getId());
            ir.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
            ir.setItemName(item.getItemName());
            ir.setItemPrice(item.getItemPrice());
            ir.setQuantity(item.getQuantity());
            ir.setGstPercent(item.getGstPercent());
            ir.setSubtotal(item.getSubtotal());
            ir.setIsCustom(item.getIsCustom());
            ir.setStatus(item.getStatus());
            ir.setNotes(item.getNotes());
            items.add(ir);
        }
        p.setItems(items);

        // Totals
        p.setSubtotal(b.getSubtotal());
        p.setGstAmount(b.getGstAmount());
        // Split GST into CGST + SGST (Indian tax structure — 9% + 9% for 18% GST)
        BigDecimal halfGst = b.getGstAmount().divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        p.setCgstAmount(halfGst);
        p.setSgstAmount(halfGst);
        p.setDiscountAmount(b.getDiscountAmount());
        p.setDiscountType(b.getDiscountType());
        p.setDiscountValue(b.getDiscountValue());
        p.setTotalAmount(b.getTotalAmount());
        p.setPaidAmount(b.getPaidAmount());
        p.setDueAmount(b.getDueAmount());
        p.setStatus(b.getStatus());

        // Payments
        List<PaymentResponse> payments = new ArrayList<>();
        for (Payment pay : b.getPayments()) {
            PaymentResponse pr = new PaymentResponse();
            pr.setId(pay.getId());
            pr.setMethod(pay.getMethod());
            pr.setAmount(pay.getAmount());
            pr.setReference(pay.getReference());
            pr.setNotes(pay.getNotes());
            pr.setReceivedByUsername(pay.getReceivedBy() != null ? pay.getReceivedBy().getUsername() : null);
            pr.setCreatedAt(pay.getCreatedAt());
            payments.add(pr);
        }
        p.setPayments(payments);

        p.setGeneratedByUsername(b.getGeneratedBy() != null ? b.getGeneratedBy().getUsername() : null);

        return p;
    }

    private String buildBillHtml(PrintableBillResponse b) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head>");
        sb.append("<meta charset='UTF-8'>");
        sb.append("<title>Bill - ").append(b.getBillNumber()).append("</title>");
        sb.append("<style>");
        sb.append("@media print { body { margin: 0; } .no-print { display: none; } }");
        sb.append("body { font-family: 'Courier New', monospace; max-width: 300px; margin: 20px auto; padding: 10px; font-size: 12px; }");
        sb.append("h2 { text-align: center; margin: 5px 0; font-size: 16px; }");
        sb.append("h3 { text-align: center; margin: 5px 0; font-size: 13px; }");
        sb.append("p { margin: 2px 0; }");
        sb.append(".center { text-align: center; }");
        sb.append(".right { text-align: right; }");
        sb.append(".bold { font-weight: bold; }");
        sb.append("table { width: 100%; border-collapse: collapse; margin: 8px 0; }");
        sb.append("th, td { padding: 3px; font-size: 11px; }");
        sb.append("th { border-bottom: 1px dashed #000; text-align: left; }");
        sb.append("tr.total td { border-top: 1px dashed #000; padding-top: 5px; }");
        sb.append("hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }");
        sb.append(".btn { padding: 10px 20px; margin: 10px 5px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 14px; }");
        sb.append("</style></head><body>");

        // Header
        sb.append("<h2>").append(safe(b.getRestaurantName())).append("</h2>");
        if (b.getRestaurantAddress() != null)
            sb.append("<p class='center'>").append(safe(b.getRestaurantAddress())).append("</p>");
        if (b.getRestaurantPhone() != null)
            sb.append("<p class='center'>Ph: ").append(safe(b.getRestaurantPhone())).append("</p>");
        if (b.getGstNumber() != null)
            sb.append("<p class='center'>GSTIN: ").append(safe(b.getGstNumber())).append("</p>");
        if (b.getFssaiNumber() != null)
            sb.append("<p class='center'>FSSAI: ").append(safe(b.getFssaiNumber())).append("</p>");

        sb.append("<hr>");

        // Bill info
        sb.append("<p><b>Bill No:</b> ").append(safe(b.getBillNumber())).append("</p>");
        sb.append("<p><b>Order No:</b> ").append(safe(b.getOrderNumber())).append("</p>");
        sb.append("<p><b>Type:</b> ").append(b.getOrderType()).append("</p>");
        if (b.getTableNumber() != null)
            sb.append("<p><b>Table:</b> ").append(b.getTableNumber()).append("</p>");
        sb.append("<p><b>Date:</b> ").append(b.getBillDate()).append("</p>");
        if (b.getCustomerName() != null)
            sb.append("<p><b>Customer:</b> ").append(safe(b.getCustomerName())).append("</p>");
        if (b.getCustomerPhone() != null)
            sb.append("<p><b>Phone:</b> ").append(safe(b.getCustomerPhone())).append("</p>");

        sb.append("<hr>");

        // Items
        sb.append("<table>");
        sb.append("<tr><th>Item</th><th class='right'>Qty</th><th class='right'>Price</th><th class='right'>Total</th></tr>");
        for (OrderItemResponse item : b.getItems()) {
            sb.append("<tr>");
            sb.append("<td>").append(safe(item.getItemName())).append("</td>");
            sb.append("<td class='right'>").append(item.getQuantity()).append("</td>");
            sb.append("<td class='right'>").append(item.getItemPrice()).append("</td>");
            sb.append("<td class='right'>").append(item.getSubtotal()).append("</td>");
            sb.append("</tr>");
        }
        sb.append("</table>");

        sb.append("<hr>");

        // Totals
        sb.append("<table>");
        sb.append("<tr><td>Subtotal:</td><td class='right'>₹").append(b.getSubtotal()).append("</td></tr>");
        sb.append("<tr><td>CGST:</td><td class='right'>₹").append(b.getCgstAmount()).append("</td></tr>");
        sb.append("<tr><td>SGST:</td><td class='right'>₹").append(b.getSgstAmount()).append("</td></tr>");
        if (b.getDiscountAmount() != null && b.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0)
            sb.append("<tr><td>Discount:</td><td class='right'>-₹").append(b.getDiscountAmount()).append("</td></tr>");
        sb.append("<tr class='total'><td class='bold'>TOTAL:</td><td class='right bold'>₹")
                .append(b.getTotalAmount()).append("</td></tr>");
        sb.append("<tr><td>Paid:</td><td class='right'>₹").append(b.getPaidAmount()).append("</td></tr>");
        if (b.getDueAmount().compareTo(BigDecimal.ZERO) > 0)
            sb.append("<tr><td class='bold'>Due:</td><td class='right bold'>₹").append(b.getDueAmount()).append("</td></tr>");
        sb.append("</table>");

        // Payments
        if (!b.getPayments().isEmpty()) {
            sb.append("<hr><p class='bold'>Payments:</p>");
            for (PaymentResponse p : b.getPayments()) {
                sb.append("<p>").append(p.getMethod()).append(": ₹").append(p.getAmount());
                if (p.getReference() != null) sb.append(" (Ref: ").append(safe(p.getReference())).append(")");
                sb.append("</p>");
            }
        }

        sb.append("<hr>");
        sb.append("<p class='center'>").append(safe(b.getFooterNote())).append("</p>");
        sb.append("<p class='center'>Status: ").append(b.getStatus()).append("</p>");

        // Print button
        sb.append("<div class='no-print center'>");
        sb.append("<button class='btn' onclick='window.print()'>🖨️ Print Bill</button>");
        sb.append("</div>");

        sb.append("</body></html>");
        return sb.toString();
    }

    private String safe(String s) {
        if (s == null) return "";
        return s.replace("<", "&lt;").replace(">", "&gt;");
    }
    /**
     * Remove a payment from a bill (ADMIN-only).
     * Useful when a payment was recorded incorrectly.
     * If the bill was settled, re-opens the order and table.
     */
    @Transactional
    public BillResponse removePayment(Long billId, Long paymentId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getStatus() == BillStatus.CANCELLED)
            throw new BadRequestException("Cannot modify payments on a cancelled bill");

        Payment payment = paymentRepo.findByIdAndBillId(paymentId, billId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found in this bill"));

        // If bill was settled, we need to re-open it
        boolean wasSettled = (bill.getStatus() == BillStatus.PAID);

        bill.getPayments().remove(payment);
        paymentRepo.delete(payment);

        // Recalculate amounts
        bill.setPaidAmount(bill.getPaidAmount().subtract(payment.getAmount()));
        bill.setDueAmount(bill.getTotalAmount().subtract(bill.getPaidAmount())
                .setScale(2, RoundingMode.HALF_UP));

        // Determine new status
        if (bill.getPaidAmount().compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(BillStatus.PENDING);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        // If bill was previously settled, undo everything
        if (wasSettled) {
            bill.setSettledAt(null);

            // Re-open the order
            Order order = bill.getOrder();
            order.setStatus(OrderStatus.RUNNING);
            order.setCompletedAt(null);
            orderRepo.save(order);

            // Re-occupy the table
            if (order.getTable() != null) {
                RestaurantTable table = order.getTable();
                table.setStatus(TableStatus.RUNNING);
                tableRepo.save(table);
            }
        }

        bill = billRepo.save(bill);
        return toResponse(bill);
    }

    /**
     * Get today's bills for a quick sales snapshot.
     * Used by admin dashboard.
     */
    public List<BillResponse> findTodaysBills() {
        Long tenantId = TenantContext.getCurrentTenantId();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        return billRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .filter(b -> !b.getCreatedAt().isBefore(startOfDay))
                .filter(b -> !b.getCreatedAt().isAfter(endOfDay))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    @Transactional
    public BillResponse applyCoupon(Long billId, String code) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getStatus() == com.restaurantpos.backend.enums.BillStatus.PAID)
            throw new BadRequestException("Cannot apply coupon to a fully paid bill");
        if (bill.getStatus() == com.restaurantpos.backend.enums.BillStatus.CANCELLED)
            throw new BadRequestException("Cannot apply coupon to a cancelled bill");

        // If a coupon was already applied, reverse its usage first
        if (bill.getCoupon() != null) {
            couponService.reverseUsage(bill.getCoupon(), bill);
        }

        // Get the customer (if order has one)
        com.restaurantpos.backend.entity.Customer customer = bill.getOrder().getCustomer();

        // Validate and calculate discount
        BigDecimal discountAmount = couponService.validateAndCalculate(
                code, bill.getSubtotal().add(bill.getGstAmount()), customer, tenantId);

        // Find the coupon entity
        com.restaurantpos.backend.entity.Coupon coupon =
                couponService.findCouponEntityByCode(code, tenantId);

        // Apply to bill
        bill.setCoupon(coupon);
        bill.setCouponCode(coupon.getCode());
        bill.setDiscountType(null);   // coupon overrides manual discount type
        bill.setDiscountValue(coupon.getValue());
        bill.setDiscountAmount(discountAmount);

        BigDecimal baseAmount = bill.getSubtotal().add(bill.getGstAmount());
        bill.setTotalAmount(baseAmount.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP));
        bill.setDueAmount(bill.getTotalAmount().subtract(bill.getPaidAmount()));

        bill = billRepo.save(bill);

        // Record usage
        couponService.recordUsage(coupon, bill, customer, discountAmount);

        return toResponse(bill);
    }

    @Transactional
    public BillResponse removeCoupon(Long billId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getCoupon() == null)
            throw new BadRequestException("No coupon applied to this bill");

        if (bill.getStatus() == com.restaurantpos.backend.enums.BillStatus.PAID)
            throw new BadRequestException("Cannot remove coupon from a paid bill");

        // Reverse usage
        couponService.reverseUsage(bill.getCoupon(), bill);

        // Reset coupon-related fields
        bill.setCoupon(null);
        bill.setCouponCode(null);
        bill.setDiscountValue(null);
        bill.setDiscountAmount(BigDecimal.ZERO);

        // Recalculate totals
        BigDecimal baseAmount = bill.getSubtotal().add(bill.getGstAmount());
        bill.setTotalAmount(baseAmount.setScale(2, RoundingMode.HALF_UP));
        bill.setDueAmount(bill.getTotalAmount().subtract(bill.getPaidAmount()));

        return toResponse(billRepo.save(bill));
    }
}