package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.CategoryRequest;
import com.restaurantpos.backend.dto.response.CategoryResponse;
import com.restaurantpos.backend.entity.Category;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.CategoryRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepo;
    private final TenantRepository tenantRepo;

    public CategoryService(CategoryRepository categoryRepo, TenantRepository tenantRepo) {
        this.categoryRepo = categoryRepo;
        this.tenantRepo = tenantRepo;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (categoryRepo.existsByNameAndTenantId(req.getName(), tenantId))
            throw new BadRequestException("Category with this name already exists");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Category category = new Category();
        category.setName(req.getName());
        category.setDescription(req.getDescription());
        category.setTenant(tenant);

        category = categoryRepo.save(category);
        return toResponse(category);
    }

    public List<CategoryResponse> findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return categoryRepo.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Category category = categoryRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(req.getName());
        category.setDescription(req.getDescription());

        return toResponse(categoryRepo.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Category category = categoryRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Soft delete
        category.setActive(false);
        categoryRepo.save(category);
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getActive());
    }
}