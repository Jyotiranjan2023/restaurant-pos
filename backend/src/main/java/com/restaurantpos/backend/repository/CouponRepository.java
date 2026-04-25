package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Coupon> findByCodeAndTenantId(String code, Long tenantId);

    boolean existsByCodeAndTenantId(String code, Long tenantId);

    List<Coupon> findByTenantIdAndActiveTrueOrderByCreatedAtDesc(Long tenantId);

    List<Coupon> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
}