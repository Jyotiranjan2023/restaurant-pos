package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByTenantIdAndActiveTrue(Long tenantId);

    List<Product> findByCategoryIdAndTenantIdAndActiveTrue(Long categoryId, Long tenantId);

    Optional<Product> findByIdAndTenantId(Long id, Long tenantId);
}