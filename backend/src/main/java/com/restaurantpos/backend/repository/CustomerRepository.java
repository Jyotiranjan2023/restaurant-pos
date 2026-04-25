package com.restaurantpos.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.restaurantpos.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByTenantIdAndActiveTrueOrderByCreatedAtDesc(Long tenantId);

    Optional<Customer> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Customer> findByPhoneAndTenantId(String phone, Long tenantId);
    
    Page<Customer> findByTenantIdAndActiveTrue(Long tenantId, Pageable pageable);


    @Query("SELECT c FROM Customer c " +
           "WHERE c.tenant.id = :tenantId AND c.active = true " +
           "AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR c.phone LIKE CONCAT('%', :query, '%')) " +
           "ORDER BY c.name")
    List<Customer> searchByTenantIdAndQuery(
            @Param("tenantId") Long tenantId,
            @Param("query") String query);

    @Query("SELECT c FROM Customer c " +
           "WHERE c.tenant.id = :tenantId AND c.active = true " +
           "ORDER BY c.totalSpent DESC")
    List<Customer> findTopSpendersByTenantId(@Param("tenantId") Long tenantId);
}