package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.CouponRequest;
import com.restaurantpos.backend.dto.response.CouponResponse;
import com.restaurantpos.backend.entity.Bill;
import com.restaurantpos.backend.entity.Coupon;
import com.restaurantpos.backend.entity.CouponUsage;
import com.restaurantpos.backend.entity.Customer;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.enums.CouponType;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.CouponRepository;
import com.restaurantpos.backend.repository.CouponUsageRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepo;
    private final CouponUsageRepository usageRepo;
    private final TenantRepository tenantRepo;

    public CouponService(CouponRepository couponRepo,
                         CouponUsageRepository usageRepo,
                         TenantRepository tenantRepo) {
        this.couponRepo = couponRepo;
        this.usageRepo = usageRepo;
        this.tenantRepo = tenantRepo;
    }

    // ========== CRUD ==========

    @Transactional
    public CouponResponse create(CouponRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        String upperCode = req.getCode().toUpperCase().trim();

        if (couponRepo.existsByCodeAndTenantId(upperCode, tenantId))
            throw new BadRequestException("Coupon code '" + upperCode + "' already exists");

        validateCouponData(req);

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Coupon c = new Coupon();
        c.setCode(upperCode);
        c.setDescription(req.getDescription());
        c.setType(req.getType());
        c.setValue(req.getValue());
        c.setMaxDiscount(req.getMaxDiscount());
        c.setMinOrderValue(req.getMinOrderValue() != null ? req.getMinOrderValue() : BigDecimal.ZERO);
        c.setValidFrom(req.getValidFrom());
        c.setValidUntil(req.getValidUntil());
        c.setMaxUsage(req.getMaxUsage());
        c.setMaxPerCustomer(req.getMaxPerCustomer());
        c.setTenant(tenant);

        return toResponse(couponRepo.save(c));
    }

    public List<CouponResponse> findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return couponRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CouponResponse findById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Coupon c = couponRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        return toResponse(c);
    }

    public CouponResponse findByCode(String code) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Coupon c = couponRepo.findByCodeAndTenantId(code.toUpperCase().trim(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        return toResponse(c);
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Coupon c = couponRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        String upperCode = req.getCode().toUpperCase().trim();

        // If code changing, check uniqueness
        if (!c.getCode().equals(upperCode) &&
            couponRepo.existsByCodeAndTenantId(upperCode, tenantId)) {
            throw new BadRequestException("Coupon code '" + upperCode + "' already exists");
        }

        validateCouponData(req);

        c.setCode(upperCode);
        c.setDescription(req.getDescription());
        c.setType(req.getType());
        c.setValue(req.getValue());
        c.setMaxDiscount(req.getMaxDiscount());
        c.setMinOrderValue(req.getMinOrderValue() != null ? req.getMinOrderValue() : BigDecimal.ZERO);
        c.setValidFrom(req.getValidFrom());
        c.setValidUntil(req.getValidUntil());
        c.setMaxUsage(req.getMaxUsage());
        c.setMaxPerCustomer(req.getMaxPerCustomer());

        return toResponse(couponRepo.save(c));
    }
    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Coupon c = couponRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        
        // Delete usage records first to avoid foreign key constraint
        usageRepo.deleteByCouponId(c.getId());
        
        // Now delete the coupon
        couponRepo.delete(c);
    }
    @Transactional
    public CouponResponse updateStatus(Long id, Boolean active) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Coupon c = couponRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        c.setActive(active);
        return toResponse(couponRepo.save(c));
    }

    // ========== Apply / Remove (Called by BillService) ==========

    /**
     * Validate coupon and calculate discount for a given bill subtotal.
     * Returns the discount amount.
     */
    @Transactional
    public BigDecimal validateAndCalculate(String code, BigDecimal billSubtotal,
                                           Customer customer, Long tenantId) {
        Coupon coupon = couponRepo.findByCodeAndTenantId(code.toUpperCase().trim(), tenantId)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!Boolean.TRUE.equals(coupon.getActive()))
            throw new BadRequestException("Coupon is not active");

        // Check date range
        LocalDate today = LocalDate.now();
        if (coupon.getValidFrom() != null && today.isBefore(coupon.getValidFrom()))
            throw new BadRequestException("Coupon is not yet valid");

        if (coupon.getValidUntil() != null && today.isAfter(coupon.getValidUntil()))
            throw new BadRequestException("Coupon has expired");

        // Check min order value
        if (billSubtotal.compareTo(coupon.getMinOrderValue()) < 0)
            throw new BadRequestException(
                "Minimum order value of ₹" + coupon.getMinOrderValue() + " required for this coupon");

        // Check overall usage limit
        if (coupon.getMaxUsage() != null && coupon.getCurrentUsage() >= coupon.getMaxUsage())
            throw new BadRequestException("Coupon usage limit reached");

        // Check per-customer limit
        if (coupon.getMaxPerCustomer() != null && customer != null) {
            long usedByCustomer = usageRepo.countByCouponIdAndCustomerId(coupon.getId(), customer.getId());
            if (usedByCustomer >= coupon.getMaxPerCustomer())
                throw new BadRequestException("You have already used this coupon the maximum number of times");
        }

        // Calculate discount
        BigDecimal discount;
        if (coupon.getType() == CouponType.FLAT) {
            discount = coupon.getValue();
        } else {
            // PERCENT
            discount = billSubtotal.multiply(coupon.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Apply max cap if set
            if (coupon.getMaxDiscount() != null &&
                discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        }

        // Discount can't exceed bill subtotal
        if (discount.compareTo(billSubtotal) > 0) {
            discount = billSubtotal;
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Record coupon usage (called after successful application).
     */
    @Transactional
    public void recordUsage(Coupon coupon, Bill bill, Customer customer,
                            BigDecimal discountAmount) {
        CouponUsage usage = new CouponUsage();
        usage.setCoupon(coupon);
        usage.setBill(bill);
        usage.setCustomer(customer);
        usage.setDiscountAmount(discountAmount);
        usage.setTenant(coupon.getTenant());
        usageRepo.save(usage);

        // Increment usage counter
        coupon.setCurrentUsage(coupon.getCurrentUsage() + 1);
        couponRepo.save(coupon);
    }

    /**
     * Reverse usage (called when coupon is removed from bill).
     */
    @Transactional
    public void reverseUsage(Coupon coupon, Bill bill) {
        // Find and delete usage record(s) for this bill
        long deleted = usageRepo.countByCouponIdAndBillId(coupon.getId(), bill.getId());
        if (deleted > 0) {
            // Decrement counter (ensure non-negative)
            int newCount = Math.max(0, coupon.getCurrentUsage() - 1);
            coupon.setCurrentUsage(newCount);
            couponRepo.save(coupon);
        }
    }

    public Coupon findCouponEntityById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return couponRepo.findByIdAndTenantId(id, tenantId).orElse(null);
    }

    public Coupon findCouponEntityByCode(String code, Long tenantId) {
        return couponRepo.findByCodeAndTenantId(code.toUpperCase().trim(), tenantId)
                .orElse(null);
    } 

    // ========== Helpers ==========

    private void validateCouponData(CouponRequest req) {
        if (req.getType() == CouponType.PERCENT &&
            req.getValue().compareTo(BigDecimal.valueOf(100)) > 0)
            throw new BadRequestException("Percent value cannot exceed 100");

        if (req.getValidFrom() != null && req.getValidUntil() != null &&
            req.getValidFrom().isAfter(req.getValidUntil()))
            throw new BadRequestException("Valid From date cannot be after Valid Until date");
    }

    private CouponResponse toResponse(Coupon c) {
        CouponResponse r = new CouponResponse();
        r.setId(c.getId());
        r.setCode(c.getCode());
        r.setDescription(c.getDescription());
        r.setType(c.getType());
        r.setValue(c.getValue());
        r.setMaxDiscount(c.getMaxDiscount());
        r.setMinOrderValue(c.getMinOrderValue());
        r.setValidFrom(c.getValidFrom());
        r.setValidUntil(c.getValidUntil());
        r.setMaxUsage(c.getMaxUsage());
        r.setMaxPerCustomer(c.getMaxPerCustomer());
        r.setCurrentUsage(c.getCurrentUsage());
        r.setActive(c.getActive());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}