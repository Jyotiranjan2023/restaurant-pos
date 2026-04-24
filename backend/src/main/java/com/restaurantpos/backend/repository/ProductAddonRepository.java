package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.ProductAddon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductAddonRepository extends JpaRepository<ProductAddon, Long> {

    List<ProductAddon> findByProductIdAndTenantIdAndActiveTrueOrderByDisplayOrderAsc(
            Long productId, Long tenantId);

    Optional<ProductAddon> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByProductIdAndNameAndTenantId(Long productId, String name, Long tenantId);
}