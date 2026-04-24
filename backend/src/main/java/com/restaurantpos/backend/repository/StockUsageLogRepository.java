package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.StockUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StockUsageLogRepository extends JpaRepository<StockUsageLog, Long> {

    List<StockUsageLog> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    @Query("SELECT l FROM StockUsageLog l " +
           "WHERE l.tenant.id = :tenantId " +
           "AND l.createdAt >= :from AND l.createdAt <= :to " +
           "ORDER BY l.createdAt DESC")
    List<StockUsageLog> findByTenantIdAndDateRange(
            @Param("tenantId") Long tenantId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}