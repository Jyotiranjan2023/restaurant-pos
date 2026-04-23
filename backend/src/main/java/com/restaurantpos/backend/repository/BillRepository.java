package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Bill> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Bill> findByOrderIdAndTenantId(Long orderId, Long tenantId);

    long countByTenantIdAndBillNumberStartingWith(Long tenantId, String prefix);
}