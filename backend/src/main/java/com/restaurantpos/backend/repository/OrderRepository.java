package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Order> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Order> findByTableIdAndStatusAndTenantId(Long tableId, OrderStatus status, Long tenantId);

    long countByTenantIdAndOrderNumberStartingWith(Long tenantId, String prefix);
}