package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    List<Ingredient> findByTenantIdAndActiveTrueOrderByNameAsc(Long tenantId);

    Optional<Ingredient> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByNameAndTenantId(String name, Long tenantId);

    @Query("SELECT i FROM Ingredient i " +
           "WHERE i.tenant.id = :tenantId AND i.active = true " +
           "AND i.currentStock <= i.lowStockThreshold " +
           "ORDER BY i.name")
    List<Ingredient> findLowStockByTenantId(@Param("tenantId") Long tenantId);
}