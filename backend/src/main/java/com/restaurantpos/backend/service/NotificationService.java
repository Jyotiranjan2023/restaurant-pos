package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.response.NotificationResponse;
import com.restaurantpos.backend.entity.Notification;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.enums.NotificationSeverity;
import com.restaurantpos.backend.enums.NotificationType;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.NotificationRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final TenantRepository tenantRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepo,
                               TenantRepository tenantRepo,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepo = notificationRepo;
        this.tenantRepo = tenantRepo;
        this.messagingTemplate = messagingTemplate;
    }

    // ========== Internal: Called by other services to create notifications ==========

    /**
     * Create a notification and broadcast via WebSocket.
     * Tenant-aware — picks up tenant from current security context.
     */
    @Transactional
    public void notify(NotificationType type, NotificationSeverity severity,
                       String title, String message, String linkUrl) {
        Long tenantId = TenantContext.getCurrentTenantId();
        notifyForTenant(tenantId, type, severity, title, message, linkUrl);
    }

    /**
     * Same as above but with explicit tenantId.
     * Used by background jobs / scheduled tasks where SecurityContext may not be set.
     */
    @Transactional
    public void notifyForTenant(Long tenantId, NotificationType type,
                                NotificationSeverity severity,
                                String title, String message, String linkUrl) {
        Tenant tenant = tenantRepo.findById(tenantId).orElse(null);
        if (tenant == null) return;

        Notification n = new Notification();
        n.setType(type);
        n.setSeverity(severity);
        n.setTitle(title);
        n.setMessage(message);
        n.setLinkUrl(linkUrl);
        n.setTenant(tenant);

        n = notificationRepo.save(n);

        // Broadcast via WebSocket to admin's browser
        try {
            messagingTemplate.convertAndSend(
                "/topic/notifications/" + tenantId,
                toResponse(n)
            );
        } catch (Exception e) {
            // Don't fail the originating action if WebSocket fails
            System.err.println("Failed to broadcast notification: " + e.getMessage());
        }
    }

    // ========== Public APIs ==========

    public Page<NotificationResponse> findAll(int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return notificationRepo
                .findByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public long getUnreadCount() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return notificationRepo.countByTenantIdAndIsReadFalse(tenantId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Notification n = notificationRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!Boolean.TRUE.equals(n.getIsRead())) {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            n = notificationRepo.save(n);
        }

        return toResponse(n);
    }

    @Transactional
    public int markAllAsRead() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return notificationRepo.markAllAsRead(tenantId, LocalDateTime.now());
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Notification n = notificationRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepo.delete(n);
    }

    @Transactional
    public int deleteAllRead() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return notificationRepo.deleteAllRead(tenantId);
    }

    /**
     * Auto-cleanup task — delete read notifications older than 30 days.
     * Can be wired to @Scheduled later.
     */
    @Transactional
    public int cleanupOldNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        return notificationRepo.deleteOldRead(cutoff);
    }

    // ========== Helpers ==========

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setType(n.getType());
        r.setSeverity(n.getSeverity());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setLinkUrl(n.getLinkUrl());
        r.setIsRead(n.getIsRead());
        r.setReadAt(n.getReadAt());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}