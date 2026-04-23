package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBillIdOrderByCreatedAtAsc(Long billId);
}