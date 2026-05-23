package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {

    /**
     * Find latest unused, non-expired reset for a user.
     */
    Optional<PasswordReset> findFirstByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);

    /**
     * Delete all previous resets for a user before creating a new one.
     * Keeps the table clean.
     */
    @Modifying
    @Query("DELETE FROM PasswordReset pr WHERE pr.userId = :userId")
    void deleteAllByUserId(Long userId);
}