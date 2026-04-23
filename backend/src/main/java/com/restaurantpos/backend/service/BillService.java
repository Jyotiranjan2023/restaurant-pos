package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.ApplyDiscountRequest;
import com.restaurantpos.backend.dto.response.BillResponse;
import com.restaurantpos.backend.dto.response.OrderItemResponse;
import com.restaurantpos.backend.dto.response.PaymentResponse;
import com.restaurantpos.backend.entity.*;
import com.restaurantpos.backend.enums.BillStatus;
import com.restaurantpos.backend.enums.DiscountType;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.enums.OrderStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.BillRepository;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillService {

    private final BillRepository billRepo;
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;

    public BillService(BillRepository billRepo,
                       OrderRepository orderRepo,
                       UserRepository userRepo,
                       TenantRepository tenantRepo) {
        this.billRepo = billRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
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
}