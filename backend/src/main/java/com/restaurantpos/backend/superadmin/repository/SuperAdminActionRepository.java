package com.restaurantpos.backend.superadmin.repository;

import com.restaurantpos.backend.superadmin.entity.SuperAdminAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuperAdminActionRepository extends JpaRepository<SuperAdminAction, Long> {

    List<SuperAdminAction> findByTargetTenantIdOrderByCreatedAtDesc(Long targetTenantId);

    List<SuperAdminAction> findBySuperAdminIdOrderByCreatedAtDesc(Long superAdminId);
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM SuperAdminAction a ORDER BY a.createdAt DESC")
    org.springframework.data.domain.Page<SuperAdminAction> findAllOrdered(org.springframework.data.domain.Pageable pageable);
}