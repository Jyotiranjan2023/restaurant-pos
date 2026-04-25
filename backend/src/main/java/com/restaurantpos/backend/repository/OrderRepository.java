package com.restaurantpos.backend.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Order> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Order> findByTableIdAndStatusAndTenantId(Long tableId, OrderStatus status, Long tenantId);
    Page<Order> findByTenantId(Long tenantId, Pageable pageable);

    long countByTenantIdAndOrderNumberStartingWith(Long tenantId, String prefix);
    @Query("SELECT COUNT(o) FROM Order o " +
    	       "WHERE o.tenant.id = :tenantId " +
    	       "AND o.status = com.restaurantpos.backend.enums.OrderStatus.RUNNING")
    	long countRunningByTenant(@Param("tenantId") Long tenantId);

    	@Query("SELECT o FROM Order o " +
    	       "WHERE o.tenant.id = :tenantId " +
    	       "AND o.createdAt >= :from AND o.createdAt <= :to")
    	List<Order> findByTenantAndDateRange(
    	        @Param("tenantId") Long tenantId,
    	        @Param("from") LocalDateTime from,
    	        @Param("to") LocalDateTime to);
    	List<Order> findByCustomerIdAndTenantIdOrderByCreatedAtDesc(Long customerId, Long tenantId);
}