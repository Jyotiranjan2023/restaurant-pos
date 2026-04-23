package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByTenantIdAndActiveTrue(Long tenantId);

    Optional<Category> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByNameAndTenantId(String name, Long tenantId);
}