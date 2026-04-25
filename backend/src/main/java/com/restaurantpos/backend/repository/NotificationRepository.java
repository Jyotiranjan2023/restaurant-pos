package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Optional<Notification> findByIdAndTenantId(Long id, Long tenantId);

    Page<Notification> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    long countByTenantIdAndIsReadFalse(Long tenantId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :now " +
           "WHERE n.tenant.id = :tenantId AND n.isRead = false")
    int markAllAsRead(@Param("tenantId") Long tenantId,
                      @Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM Notification n " +
           "WHERE n.tenant.id = :tenantId AND n.isRead = true")
    int deleteAllRead(@Param("tenantId") Long tenantId);

    @Modifying
    @Query("DELETE FROM Notification n " +
           "WHERE n.isRead = true AND n.readAt < :cutoff")
    int deleteOldRead(@Param("cutoff") LocalDateTime cutoff);
}