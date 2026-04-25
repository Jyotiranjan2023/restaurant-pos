package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.FeedbackRequest;
import com.restaurantpos.backend.dto.response.FeedbackResponse;
import com.restaurantpos.backend.dto.response.FeedbackStatsResponse;
import com.restaurantpos.backend.dto.response.ProductRatingResponse;
import com.restaurantpos.backend.entity.Bill;
import com.restaurantpos.backend.entity.Feedback;
import com.restaurantpos.backend.entity.Product;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.enums.BillStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.BillRepository;
import com.restaurantpos.backend.repository.FeedbackRepository;
import com.restaurantpos.backend.repository.ProductRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepo;
    private final BillRepository billRepo;
    private final ProductRepository productRepo;
    private final TenantRepository tenantRepo;

    public FeedbackService(FeedbackRepository feedbackRepo,
                           BillRepository billRepo,
                           ProductRepository productRepo,
                           TenantRepository tenantRepo) {
        this.feedbackRepo = feedbackRepo;
        this.billRepo = billRepo;
        this.productRepo = productRepo;
        this.tenantRepo = tenantRepo;
    }

    @Transactional
    public FeedbackResponse submit(FeedbackRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Bill bill = billRepo.findByIdAndTenantId(req.getBillId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        // Only allow feedback for settled bills
        if (bill.getStatus() != BillStatus.PAID)
            throw new BadRequestException("Feedback can only be submitted for paid bills");

        // One feedback per bill
        if (feedbackRepo.existsByBillIdAndTenantId(req.getBillId(), tenantId))
            throw new BadRequestException("Feedback already submitted for this bill");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Feedback f = new Feedback();
        f.setRating(req.getRating());
        f.setComment(req.getComment());
        f.setBill(bill);
        f.setCustomer(bill.getOrder().getCustomer());   // auto-link if order had customer
        f.setCustomerName(req.getCustomerName() != null
                ? req.getCustomerName()
                : bill.getOrder().getCustomerName());
        f.setCustomerPhone(req.getCustomerPhone() != null
                ? req.getCustomerPhone()
                : bill.getOrder().getCustomerPhone());
        f.setTenant(tenant);

        return toResponse(feedbackRepo.save(f));
    }

    public Page<FeedbackResponse> findAll(int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return feedbackRepo
                .findByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public FeedbackResponse findById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Feedback f = feedbackRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        return toResponse(f);
    }

    public FeedbackResponse findByBillId(Long billId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Feedback f = feedbackRepo.findByBillIdAndTenantId(billId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("No feedback for this bill"));
        return toResponse(f);
    }

    public FeedbackStatsResponse getStats() {
        Long tenantId = TenantContext.getCurrentTenantId();

        long total = feedbackRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).size();
        Double avg = feedbackRepo.findAverageRatingByTenant(tenantId);

        // Build distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) distribution.put(i, 0L);   // initialize all stars

        List<Object[]> rows = feedbackRepo.countByRatingForTenant(tenantId);
        for (Object[] row : rows) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            distribution.put(rating, count);
        }

        return new FeedbackStatsResponse(
                total,
                avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0,
                distribution
        );
    }

    public ProductRatingResponse getProductRating(Long productId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Product product = productRepo.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Double avg = feedbackRepo.findAverageRatingForProduct(tenantId, productId);
        Long count = feedbackRepo.countFeedbackForProduct(tenantId, productId);

        return new ProductRatingResponse(
                product.getId(),
                product.getName(),
                avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0,
                count != null ? count : 0L
        );
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Feedback f = feedbackRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        feedbackRepo.delete(f);
    }

    // ========== Helpers ==========

    private FeedbackResponse toResponse(Feedback f) {
        FeedbackResponse r = new FeedbackResponse();
        r.setId(f.getId());
        r.setBillId(f.getBill().getId());
        r.setBillNumber(f.getBill().getBillNumber());
        r.setOrderId(f.getBill().getOrder().getId());
        r.setOrderNumber(f.getBill().getOrder().getOrderNumber());
        r.setRating(f.getRating());
        r.setComment(f.getComment());
        r.setCustomerName(f.getCustomerName());
        r.setCustomerPhone(f.getCustomerPhone());
        r.setCreatedAt(f.getCreatedAt());
        return r;
    }
}