package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    long countByCouponIdAndCustomerId(Long couponId, Long customerId);

    long countByCouponIdAndBillId(Long couponId, Long billId);
    void deleteByCouponId(Long couponId);
}