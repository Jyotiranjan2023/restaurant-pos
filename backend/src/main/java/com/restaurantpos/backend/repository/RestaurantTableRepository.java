package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    List<RestaurantTable> findByTenantIdAndActiveTrueOrderByTableNumberAsc(Long tenantId);

    Optional<RestaurantTable> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTableNumberAndTenantId(Integer tableNumber, Long tenantId);
}