package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.ProductAddonRequest;
import com.restaurantpos.backend.dto.response.ProductAddonResponse;
import com.restaurantpos.backend.entity.Product;
import com.restaurantpos.backend.entity.ProductAddon;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.ProductAddonRepository;
import com.restaurantpos.backend.repository.ProductRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductAddonService {

    private final ProductAddonRepository addonRepo;
    private final ProductRepository productRepo;
    private final TenantRepository tenantRepo;

    public ProductAddonService(ProductAddonRepository addonRepo,
                               ProductRepository productRepo,
                               TenantRepository tenantRepo) {
        this.addonRepo = addonRepo;
        this.productRepo = productRepo;
        this.tenantRepo = tenantRepo;
    }

    @Transactional
    public ProductAddonResponse create(Long productId, ProductAddonRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Product product = productRepo.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (addonRepo.existsByProductIdAndNameAndTenantId(productId, req.getName(), tenantId))
            throw new BadRequestException("Addon '" + req.getName() + "' already exists for this product");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        ProductAddon addon = new ProductAddon();
        addon.setName(req.getName());
        addon.setPrice(req.getPrice());
        addon.setGstPercent(req.getGstPercent());
        addon.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
        addon.setProduct(product);
        addon.setTenant(tenant);

        return toResponse(addonRepo.save(addon));
    }

    public List<ProductAddonResponse> findByProduct(Long productId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        productRepo.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return addonRepo
                .findByProductIdAndTenantIdAndActiveTrueOrderByDisplayOrderAsc(productId, tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductAddonResponse update(Long productId, Long addonId, ProductAddonRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        ProductAddon addon = addonRepo.findByIdAndTenantId(addonId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Addon not found"));

        if (!addon.getProduct().getId().equals(productId))
            throw new BadRequestException("Addon does not belong to this product");

        if (!addon.getName().equals(req.getName()) &&
            addonRepo.existsByProductIdAndNameAndTenantId(productId, req.getName(), tenantId)) {
            throw new BadRequestException("Addon '" + req.getName() + "' already exists for this product");
        }

        addon.setName(req.getName());
        addon.setPrice(req.getPrice());
        addon.setGstPercent(req.getGstPercent());
        if (req.getDisplayOrder() != null) addon.setDisplayOrder(req.getDisplayOrder());

        return toResponse(addonRepo.save(addon));
    }

    @Transactional
    public void delete(Long productId, Long addonId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        ProductAddon addon = addonRepo.findByIdAndTenantId(addonId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Addon not found"));

        if (!addon.getProduct().getId().equals(productId))
            throw new BadRequestException("Addon does not belong to this product");

        addon.setActive(false);
        addonRepo.save(addon);
    }

    // ========== Helpers ==========

    private ProductAddonResponse toResponse(ProductAddon a) {
        return new ProductAddonResponse(
            a.getId(),
            a.getProduct().getId(),
            a.getName(),
            a.getPrice(),
            a.getGstPercent(),
            a.getDisplayOrder(),
            a.getActive()
        );
    }
}