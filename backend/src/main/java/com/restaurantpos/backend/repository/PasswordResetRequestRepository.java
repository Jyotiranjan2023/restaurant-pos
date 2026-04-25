package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.PasswordResetRequest;
import com.restaurantpos.backend.enums.ResetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    Optional<PasswordResetRequest> findByIdAndTenantId(Long id, Long tenantId);

    List<PasswordResetRequest> findByTenantIdAndStatusOrderByCreatedAtDesc(
            Long tenantId, ResetStatus status);

    List<PasswordResetRequest> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime since);

    Optional<PasswordResetRequest> findFirstByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, ResetStatus status);
}