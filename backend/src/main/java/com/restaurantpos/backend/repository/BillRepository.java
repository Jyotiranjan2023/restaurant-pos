package com.restaurantpos.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.restaurantpos.backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Bill> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Bill> findByOrderIdAndTenantId(Long orderId, Long tenantId);
    Page<Bill> findByTenantId(Long tenantId, Pageable pageable);

    long countByTenantIdAndBillNumberStartingWith(Long tenantId, String prefix);
    @Query("SELECT b FROM Bill b " +
    	       "WHERE b.tenant.id = :tenantId " +
    	       "AND b.status = com.restaurantpos.backend.enums.BillStatus.PAID " +
    	       "AND b.settledAt >= :from AND b.settledAt <= :to")
    	List<Bill> findPaidByTenantAndDateRange(
    	        @Param("tenantId") Long tenantId,
    	        @Param("from") LocalDateTime from,
    	        @Param("to") LocalDateTime to);
}