package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdAndTenantIdAndActiveTrueOrderByDisplayOrderAsc(
            Long productId, Long tenantId);

    Optional<ProductVariant> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByProductIdAndNameAndTenantId(Long productId, String name, Long tenantId);
}