package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.enums.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    Optional<OrderItem> findByIdAndOrderId(Long id, Long orderId);

    /**
     * Find all items for a tenant by item status, filtered via parent Order's tenantId.
     * Used by Kitchen and Waiter views.
     */
    @Query("SELECT oi FROM OrderItem oi " +
           "WHERE oi.order.tenant.id = :tenantId " +
           "AND oi.status IN :statuses " +
           "AND oi.order.status = com.restaurantpos.backend.enums.OrderStatus.RUNNING " +
           "ORDER BY oi.createdAt ASC")
    List<OrderItem> findByTenantIdAndStatusIn(
            @Param("tenantId") Long tenantId,
            @Param("statuses") List<OrderItemStatus> statuses);
}