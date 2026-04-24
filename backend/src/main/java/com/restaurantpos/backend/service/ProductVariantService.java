package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.ProductVariantRequest;
import com.restaurantpos.backend.dto.response.ProductVariantResponse;
import com.restaurantpos.backend.entity.Product;
import com.restaurantpos.backend.entity.ProductVariant;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.ProductRepository;
import com.restaurantpos.backend.repository.ProductVariantRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductVariantService {

    private final ProductVariantRepository variantRepo;
    private final ProductRepository productRepo;
    private final TenantRepository tenantRepo;

    public ProductVariantService(ProductVariantRepository variantRepo,
                                 ProductRepository productRepo,
                                 TenantRepository tenantRepo) {
        this.variantRepo = variantRepo;
        this.productRepo = productRepo;
        this.tenantRepo = tenantRepo;
    }

    @Transactional
    public ProductVariantResponse create(Long productId, ProductVariantRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Product product = productRepo.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (variantRepo.existsByProductIdAndNameAndTenantId(productId, req.getName(), tenantId))
            throw new BadRequestException("Variant '" + req.getName() + "' already exists for this product");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        ProductVariant variant = new ProductVariant();
        variant.setName(req.getName());
        variant.setPrice(req.getPrice());
        variant.setGstPercent(req.getGstPercent());
        variant.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
        variant.setProduct(product);
        variant.setTenant(tenant);

        return toResponse(variantRepo.save(variant));
    }

    public List<ProductVariantResponse> findByProduct(Long productId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        // Verify product belongs to this tenant
        productRepo.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return variantRepo
                .findByProductIdAndTenantIdAndActiveTrueOrderByDisplayOrderAsc(productId, tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductVariantResponse update(Long productId, Long variantId, ProductVariantRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        ProductVariant variant = variantRepo.findByIdAndTenantId(variantId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (!variant.getProduct().getId().equals(productId))
            throw new BadRequestException("Variant does not belong to this product");

        // If name changing, check uniqueness
        if (!variant.getName().equals(req.getName()) &&
            variantRepo.existsByProductIdAndNameAndTenantId(productId, req.getName(), tenantId)) {
            throw new BadRequestException("Variant '" + req.getName() + "' already exists for this product");
        }

        variant.setName(req.getName());
        variant.setPrice(req.getPrice());
        variant.setGstPercent(req.getGstPercent());
        if (req.getDisplayOrder() != null) variant.setDisplayOrder(req.getDisplayOrder());

        return toResponse(variantRepo.save(variant));
    }

    @Transactional
    public void delete(Long productId, Long variantId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        ProductVariant variant = variantRepo.findByIdAndTenantId(variantId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (!variant.getProduct().getId().equals(productId))
            throw new BadRequestException("Variant does not belong to this product");

        variant.setActive(false);
        variantRepo.save(variant);
    }

    // ========== Helpers ==========

    private ProductVariantResponse toResponse(ProductVariant v) {
        return new ProductVariantResponse(
            v.getId(),
            v.getProduct().getId(),
            v.getName(),
            v.getPrice(),
            v.getGstPercent(),
            v.getDisplayOrder(),
            v.getActive()
        );
    }
}