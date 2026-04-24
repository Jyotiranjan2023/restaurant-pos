package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByIdAndBillId(Long id, Long billId);
}