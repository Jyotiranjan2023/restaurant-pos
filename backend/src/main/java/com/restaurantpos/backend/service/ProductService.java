package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.ProductRequest;
import com.restaurantpos.backend.dto.response.ProductResponse;
import com.restaurantpos.backend.entity.Category;
import com.restaurantpos.backend.entity.Product;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.CategoryRepository;
import com.restaurantpos.backend.repository.ProductRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final TenantRepository tenantRepo;

    public ProductService(ProductRepository productRepo,
                          CategoryRepository categoryRepo,
                          TenantRepository tenantRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.tenantRepo = tenantRepo;
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Category category = categoryRepo.findByIdAndTenantId(req.getCategoryId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Product product = new Product();
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setGstPercent(req.getGstPercent());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(category);
        product.setTenant(tenant);
        product.setAvailable(req.getAvailable() != null ? req.getAvailable() : true);

        return toResponse(productRepo.save(product));
    }

    public List<ProductResponse> findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return productRepo.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse findById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Product product = productRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    public List<ProductResponse> findByCategory(Long categoryId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return productRepo.findByCategoryIdAndTenantIdAndActiveTrue(categoryId, tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Product product = productRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepo.findByIdAndTenantId(req.getCategoryId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setGstPercent(req.getGstPercent());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(category);
        if (req.getAvailable() != null) product.setAvailable(req.getAvailable());

        return toResponse(productRepo.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Product product = productRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setActive(false);
        productRepo.save(product);
    }

    private ProductResponse toResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setPrice(p.getPrice());
        r.setGstPercent(p.getGstPercent());
        r.setImageUrl(p.getImageUrl());
        r.setCategoryId(p.getCategory().getId());
        r.setCategoryName(p.getCategory().getName());
        r.setAvailable(p.getAvailable());
        r.setActive(p.getActive());
        return r;
    }
}